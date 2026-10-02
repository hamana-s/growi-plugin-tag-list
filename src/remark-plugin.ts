import { visit } from 'unist-util-visit';

export const TAG_LIST_HREF = '#growi-plugin-tag-list';

// $taglist() / $taglist(sort=name) を <a href="#growi-plugin-tag-list?sort=..."> に変換する。
// 独自タグ名にすると GROWI の sanitize で除去されるため、許可済みの a 要素を目印に使う。
export const remarkPlugin = () => (tree: any) => {
  visit(tree, (node: any) => {
    if (node.type !== 'leafGrowiPluginDirective' && node.type !== 'textGrowiPluginDirective') {
      return;
    }
    if (node.name !== 'taglist') {
      return;
    }
    const sort = node.attributes?.sort === 'name' ? 'name' : 'count';
    const data = node.data ?? (node.data = {});
    data.hName = 'a';
    data.hProperties = { href: `${TAG_LIST_HREF}?sort=${sort}` };
    node.children = [];
  });
};
