import { GraphHelper } from '../Helper/GraphHelper';
import { BaseGraph } from '../xflow';

export class ERGraphViewModel {
  baseGraph?: BaseGraph;

  init(container: HTMLElement, minimapContainer: HTMLElement) {
    /** 初始化画布 */
    this.baseGraph = new BaseGraph({
      container,
      grid: {
        visible: false,
      },
      autoResize: true,
      // onPortRendered(args) {
      //   const selectors = args.contentSelectors;
      //   const container = selectors && selectors.foContent;
      //   if (container) {
      //     console.log(container);
      //   }
      // },
      onEdgeLabelRendered: args => {

        const { selectors } = args;
        const content = selectors.foContent as HTMLDivElement;
        if (content) {
          const btn = document.createElement('button');
          btn.appendChild(document.createTextNode('HTML Button'));
          btn.style.width = '100%';
          btn.style.height = '100%';
          btn.style.lineHeight = '1';
          btn.style.borderRadius = '4px';
          btn.style.textAlign = 'center';
          btn.style.color = '#000';
          btn.style.background = '#ffd591';
          btn.style.border = '2px solid #ffa940';
          btn.addEventListener('click', () => {
            alert('clicked');
          });
          content.appendChild(btn);
        }
      },
      minimap: {
        enabled: true,
        container: minimapContainer,
        width: 200,
        height: 200,
        minScale: 0.5,
        maxScale: 2,
      },
    });
    // /** 渲染画布内容 */
    // baseGraph.updateGraph(props.data);
    // baseGraph.registerEvent([
    //   {
    //     eventName: 'scale',
    //     handler: (scale: number) => {},
    //   },
    // ]);
  }

  onHandleToolbar = (action: 'in' | 'out' | 'fit' | 'real') => {
    if (!this.baseGraph) {
      return;
    }
    switch (action) {
      case 'in':
        this.baseGraph.zoomGraph(0.1);
        break;
      case 'out':
        this.baseGraph.zoomGraph(-0.1);
        break;
      case 'fit':
        this.baseGraph.zoomGraph('fit');
        break;
      case 'real':
        this.baseGraph.zoomGraph('real');
        break;
      default:
    }
  };

  save() {
    if (this.baseGraph) {
      const result = this.baseGraph.graph.toJSON();
      return result;
    }
    return undefined;
  }
}
