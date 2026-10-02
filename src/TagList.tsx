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

type TagListProps = { sort: string, num: number | null, more: boolean };

const TagList = ({ sort, num, more }: TagListProps): any => {
  const React = getReact();
  const h = React.createElement;
  const [tags, setTags] = React.useState(null as Tag[] | null);
  const [error, setError] = React.useState(null as string | null);
  const [visibleCount, setVisibleCount] = React.useState(num);

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
  const visible = visibleCount == null ? sorted : sorted.slice(0, visibleCount);
  const rest = sorted.length - visible.length;

  const list = h(
    'span',
    { className: 'd-flex flex-wrap gap-2' },
    visible.map(tag => h(
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

  const moreButton = more && rest > 0 && num != null
    ? h(
      'button',
      {
        type: 'button',
        className: 'btn btn-sm btn-outline-secondary mt-2',
        onClick: () => setVisibleCount(visible.length + num),
      },
      `さらに表示（残り ${rest} 件）`,
    )
    : null;

  return h('span', { className: 'd-block' }, list, moreButton);
};

export const withTagList = (A: any) => {
  return (props: any): any => {
    const h = getReact().createElement;
    const href: unknown = props.href;
    if (typeof href === 'string' && href.startsWith(TAG_LIST_HREF)) {
      const params = new URLSearchParams(href.split('?')[1] ?? '');
      const num = Number.parseInt(params.get('num') ?? '', 10);
      return h(TagList, {
        sort: params.get('sort') ?? 'count',
        num: num > 0 ? num : null,
        more: params.get('more') === 'true',
      });
    }
    return h(A ?? 'a', props);
  };
};
