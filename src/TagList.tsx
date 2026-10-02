import { TAG_LIST_HREF } from './remark-plugin';

// プラグインに React を同梱すると GROWI 本体の React と別インスタンスになり、
// フックが動かない。必ず growiFacade 経由で本体の React を使う。
const getReact = (): any => (window as any).growiFacade.react;

type Tag = { name: string, count: number };

const LIMIT = 100;

const fetchAllTags = async(): Promise<Tag[]> => {
  const result: Tag[] = [];
  for (let offset = 0; ; offset += LIMIT) {
    const res = await fetch(`/_api/tags.list?offset=${offset}&limit=${LIMIT}`, { credentials: 'same-origin' });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json();
    if (json.ok === false) {
      throw new Error(json.error ?? 'unknown error');
    }
    const data: Tag[] = json.data ?? [];
    result.push(...data);
    if (data.length < LIMIT || result.length >= (json.totalCount ?? 0)) {
      return result;
    }
  }
};

const TagList = ({ sort }: { sort: string }): any => {
  const React = getReact();
  const h = React.createElement;
  const [tags, setTags] = React.useState(null as Tag[] | null);
  const [error, setError] = React.useState(null as string | null);

  React.useEffect(() => {
    fetchAllTags().then(setTags).catch((e: unknown) => setError(String(e)));
  }, []);

  if (error != null) {
    return h('span', { className: 'text-danger' }, `タグ一覧の取得に失敗しました: ${error}`);
  }
  if (tags == null) {
    return h('span', { className: 'text-muted' }, 'タグ一覧を読み込み中...');
  }
  if (tags.length === 0) {
    return h('span', { className: 'text-muted' }, 'タグがありません');
  }

  const sorted = [...tags].sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name, 'ja') : b.count - a.count));

  return h(
    'span',
    { className: 'd-flex flex-wrap gap-2' },
    sorted.map(tag => h(
      'a',
      {
        key: tag.name,
        href: `/_search?q=${encodeURIComponent(`tag:${tag.name}`)}`,
        className: 'badge bg-primary text-decoration-none',
        // テーマの本文リンク色 (.wiki a など) に上書きされないようインラインで指定する
        style: { color: '#fff' },
      },
      `${tag.name} (${tag.count})`,
    )),
  );
};

export const withTagList = (A: any) => {
  return (props: any): any => {
    const h = getReact().createElement;
    const href: unknown = props.href;
    if (typeof href === 'string' && href.startsWith(TAG_LIST_HREF)) {
      const sort = new URLSearchParams(href.split('?')[1] ?? '').get('sort') ?? 'count';
      return h(TagList, { sort });
    }
    return h(A ?? 'a', props);
  };
};
