import { visit } from 'unist-util-visit';

export const TAG_LIST_HREF = '#growi-plugin-tag-list';

// $taglist(sort=name, num=20, more, dept=営業部) を <a href="#growi-plugin-tag-list?sort=...&num=...&more=...&dept=..."> に変換する。
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
    // more だけ書いた場合は値が空文字になる
    if (attributes.more != null && attributes.more !== 'false') {
      params.set('more', 'true');
    }
    if (typeof attributes.dept === 'string' && attributes.dept !== '') {
      params.set('dept', attributes.dept);
    }
    const data = node.data ?? (node.data = {});
    data.hName = 'a';
    data.hProperties = { href: `${TAG_LIST_HREF}?${params.toString()}` };
    node.children = [];
  });
};
