import { visit } from 'unist-util-visit';

export const TAG_LIST_HREF = '#growi-plugin-tag-list';

// $taglist(sort=name, num=20, more, filter=営業部, large, newline) を <a href="#growi-plugin-tag-list?sort=...&num=...&more=...&filter=...&large=...&newline=..."> に変換する。
// 独自タグ名にすると GROWI の sanitize で除去されるため、許可済みの a 要素を目印に使う。
export const remarkPlugin = () => (tree: any) => {
  visit(tree, (node: any) => {
    if (node.type !== 'leafGrowiPluginDirective' && node.type !== 'textGrowiPluginDirective') {
      return;
    }
    if (node.name !== 'taglist') {
      return;
    }
    const attributes = node.attributes ?? {};
    const params = new URLSearchParams();
    params.set('sort', attributes.sort === 'name' ? 'name' : 'count');
    const num = Number.parseInt(attributes.num, 10);
    if (num > 0) {
      params.set('num', String(num));
    }
    // more / large / newline は名前だけ書いた場合に値が空文字になる
    for (const flag of ['more', 'large', 'newline']) {
      if (attributes[flag] != null && attributes[flag] !== 'false') {
        params.set(flag, 'true');
      }
    }
    if (typeof attributes.filter === 'string' && attributes.filter !== '') {
      params.set('filter', attributes.filter);
    }
    const data = node.data ?? (node.data = {});
    data.hName = 'a';
    data.hProperties = { href: `${TAG_LIST_HREF}?${params.toString()}` };
    node.children = [];
  });
};
