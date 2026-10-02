import { remarkPlugin } from './src/remark-plugin';
import { withTagList } from './src/TagList';

declare const growiFacade: any;

const activate = (): void => {
  if (growiFacade == null || growiFacade.markdownRenderer == null) {
    return;
  }

  const { optionsGenerators } = growiFacade.markdownRenderer;

  // view
  const originalCustomViewOptions = optionsGenerators.customGenerateViewOptions;
  optionsGenerators.customGenerateViewOptions = (...args: any[]) => {
    const options = originalCustomViewOptions ? originalCustomViewOptions(...args) : optionsGenerators.generateViewOptions(...args);
    options.remarkPlugins.push(remarkPlugin);
    options.components.a = withTagList(options.components.a);
    return options;
  };

  // preview
  const originalCustomPreviewOptions = optionsGenerators.customGeneratePreviewOptions;
  optionsGenerators.customGeneratePreviewOptions = (...args: any[]) => {
    const options = originalCustomPreviewOptions ? originalCustomPreviewOptions(...args) : optionsGenerators.generatePreviewOptions(...args);
    options.remarkPlugins.push(remarkPlugin);
    options.components.a = withTagList(options.components.a);
    return options;
  };
};

const deactivate = (): void => {
};

// register activate
if ((window as any).pluginActivators == null) {
  (window as any).pluginActivators = {};
}
(window as any).pluginActivators['growi-plugin-tag-list'] = {
  activate,
  deactivate,
};
