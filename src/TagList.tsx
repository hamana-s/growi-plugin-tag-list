import React, { useEffect, useState } from 'react';

import { TAG_LIST_HREF } from './remark-plugin';

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

const TagList = ({ sort }: { sort: string }): JSX.Element => {
  const [tags, setTags] = useState<Tag[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllTags().then(setTags).catch(e => setError(String(e)));
  }, []);

  if (error != null) {
    return <span className="text-danger">タグ一覧の取得に失敗しました: {error}</span>;
  }
  if (tags == null) {
    return <span className="text-muted">タグ一覧を読み込み中...</span>;
  }
  if (tags.length === 0) {
    return <span className="text-muted">タグがありません</span>;
  }

  const sorted = [...tags].sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name, 'ja') : b.count - a.count));

  return (
    <span className="d-flex flex-wrap gap-2">
      {sorted.map(tag => (
        <a
          key={tag.name}
          href={`/_search?q=${encodeURIComponent(`tag:${tag.name}`)}`}
          className="badge bg-primary text-decoration-none"
        >
          {tag.name} ({tag.count})
        </a>
      ))}
    </span>
  );
};

export const withTagList = (A: any) => {
  return (props: any): JSX.Element => {
    const href: unknown = props.href;
    if (typeof href === 'string' && href.startsWith(TAG_LIST_HREF)) {
      const sort = new URLSearchParams(href.split('?')[1] ?? '').get('sort') ?? 'count';
      return <TagList sort={sort} />;
    }
    return A != null ? <A {...props} /> : <a {...props} />;
  };
};
