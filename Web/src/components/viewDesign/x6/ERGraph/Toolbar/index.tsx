import { Popover } from 'ant-design-vue';
import {
  CompressOutlined,
  OneToOneOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  GithubOutlined,
} from '@ant-design/icons-vue';
import classNames from 'classnames';
import styles from './index.module.less';

// export component
export default defineComponent<
  {
    className: string;
  },
  any,
  any,
  any,
  any,
  any,
  any,
  [`ZoomIn`, `ZoomOut`, `FitContent`, `RealContent`]
>({
  name: 'GraphToolbar',
  functional: true,
  components: {
    Popover,
    ZoomInOutlined,
    ZoomOutOutlined,
    OneToOneOutlined,
    CompressOutlined,
    GithubOutlined,
  },
  setup(this, props, ctx) {
    return () => (
      <ul class={classNames(styles.handler, props.className)}>
        <Popover overlayClassName={styles.popover} content="放大" placement="left">
          <li
            onClick={(e: any) => {
              ctx.emit('ZoomIn', e);
            }}
            class={styles.item}
          >
            <zoom-in-outlined />
          </li>
        </Popover>
        <Popover overlayClassName={styles.popover} content="缩小" placement="left">
          <li
            onClick={(e: any) => {
              ctx.emit('ZoomOut', e);
            }}
            class={styles.item}
          >
            <zoom-out-outlined />
          </li>
        </Popover>
        <Popover overlayClassName={styles.popover} content="实际尺寸" placement="left">
          <li
            onClick={(e: any) => {
              ctx.emit('RealContent', e);
            }}
            class={styles.item}
          >
            <one-to-one-outlined />
          </li>
        </Popover>
        <Popover overlayClassName={styles.popover} content="适应画布" placement="left">
          <li
            onClick={(e: any) => {
              ctx.emit('FitContent', e);
            }}
            class={styles.item}
          >
            <compress-outlined />
          </li>
        </Popover>
      </ul>
    );
  },
});
