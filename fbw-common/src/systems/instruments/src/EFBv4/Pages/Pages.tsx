import {
  ComponentProps,
  DisplayComponent,
  FSComponent,
  MappedSubject,
  Subscribable,
  SubscribableUtils,
  VNode,
} from '@microsoft/msfs-sdk';

import { PageEnum } from '../Shared/common';
import { AbstractUIView, UIVIew, UIVIewUtils } from '../Shared/UIView';
import { twMerge } from 'tailwind-merge';

// Page should be an enum
export type Pages = readonly [page: number, component: VNode][];

interface SwitchProps extends ComponentProps {
  activePage: Subscribable<number>;
  pages: Pages;
  class?: string | Subscribable<string>;
}

export class Switch extends AbstractUIView<SwitchProps> {
  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(
      this.props.activePage.sub((activePage) => {
        this.forEachSwitchChild((switchChild) => {
          if (switchChild.index === activePage) {
            switchChild.show();
          } else {
            switchChild.hide();
          }
        });
      }, true),
    );
  }

  hide() {
    this.forEachSwitchChild((switchChild) => switchChild.hide());
  }

  show() {
    this.forEachSwitchChild((switchChild) => switchChild.show());
  }

  resume() {
    super.resume((child) => !(child instanceof UIVIewWrapper));

    this.forEachSwitchChild((switchChild) => {
      if (switchChild instanceof UIVIewWrapper && switchChild.index === this.props.activePage.get()) {
        switchChild.resume();
      }
    });
  }

  pause() {
    super.pause((child) => !(child instanceof UIVIewWrapper));

    this.forEachSwitchChild((switchChild) => {
      if (switchChild instanceof UIVIewWrapper && switchChild.index === this.props.activePage.get()) {
        switchChild.pause();
      }
    });
  }

  private forEachSwitchChild(func: (child: SwitchChild) => void) {
    if (!this.vnode) {
      return;
    }

    FSComponent.visitNodes(this.vnode, (child) => {
      if (child === this.vnode || child.instance instanceof HTMLElement || child.instance === null) {
        return false;
      }

      const switchChild = child.instance as unknown as SwitchChild;

      func(switchChild);

      return true;
    });
  }

  private readonly pageVisibility = (page: number) => {
    const subject = MappedSubject.create(
      ([activePage, isPaused]) => {
        if (isPaused) {
          return false;
        }

        return activePage === page;
      },
      this.props.activePage,
      this.isPaused,
    );

    this.subscriptions.push(subject);

    return subject;
  };

  private readonly class = MappedSubject.create(
    ([propClass]) => {
      return twMerge('', propClass);
    },
    SubscribableUtils.toSubscribable(this.props.class, true),
  );

  render(): VNode {
    return (
      <>
        {this.props.pages.map(([page, component]) =>
          UIVIewUtils.isUIVIew(component.instance) ? (
            <UIVIewWrapper index={page} view={component} isVisible={this.pageVisibility(page)} />
          ) : (
            <PageWrapper index={page} isVisible={this.pageVisibility(page)} node={component} />
          ),
        )}
      </>
    );
  }
}

interface SwitchChild {
  index: number;

  show(): void;

  hide(): void;
}

interface PageWrapperProps extends ComponentProps {
  index: number;

  isVisible: Subscribable<Boolean>;

  node: VNode;
}

export class PageWrapper extends DisplayComponent<PageWrapperProps> implements SwitchChild {
  get index() {
    return this.props.index;
  }

  private getVNodeDomNode(vnode: VNode): HTMLElement | SVGElement | null {
    if (vnode.instance instanceof HTMLElement || vnode.instance instanceof SVGElement) {
      return vnode.instance;
    }

    if (vnode.root && (vnode.root instanceof HTMLElement || vnode.root instanceof SVGElement)) {
      return vnode.root;
    }

    if (vnode.children && vnode.children.length > 0) {
      return this.getVNodeDomNode(vnode.children[0]);
    }

    return null;
  }

  show() {
    this.getVNodeDomNode(this.props.node)?.classList.toggle('view-hidden', false);
  }

  hide() {
    this.getVNodeDomNode(this.props.node)?.classList.toggle('view-hidden', true);
  }

  render(): VNode {
    return this.props.node;
  }
}

interface UIVIewWrapperProps extends ComponentProps {
  view: VNode;

  index: number;

  isVisible: Subscribable<boolean>;
}

class UIVIewWrapper extends AbstractUIView<UIVIewWrapperProps> implements SwitchChild {
  get index() {
    return this.props.index;
  }

  get view(): UIVIew {
    return this.props.view.instance as unknown as UIVIew;
  }

  show() {
    this.view.show();
    this.view.resume();
  }

  hide() {
    this.view.hide();
    this.view.pause();
  }

  resume() {
    if (this.props.isVisible.get()) {
      this.view.resume();
    }
  }

  pause() {
    this.view.pause();
  }

  destroy() {
    this.view.destroy();
  }

  render(): VNode | null {
    return this.props.view;
  }
}

export interface SwitchIfProps {
  class?: string;
  condition: Subscribable<boolean>;
  on: VNode;
  off: VNode;
}

export class SwitchIf extends AbstractUIView<SwitchIfProps> {
  render(): VNode | null {
    return (
      <Switch
        class={this.props.class}
        activePage={this.props.condition.map((value) => (value ? PageEnum.SwitchIf.True : PageEnum.SwitchIf.False))}
        pages={[
          [PageEnum.SwitchIf.False, this.props.off],
          [PageEnum.SwitchIf.True, this.props.on],
        ]}
      />
    );
  }
}

export interface SwitchOnProps {
  class?: string;
  condition: Subscribable<boolean>;
  on: VNode;
}

export class SwitchOn extends AbstractUIView<SwitchOnProps> {
  private readonly class = MappedSubject.create(([condition]) => {
    let classReturn = '';
    if (!condition) {
      classReturn = 'hidden';
    }

    return twMerge(classReturn, this.props.class ?? '');
  }, this.props.condition);

  render(): VNode | null {
    return (
      <Switch
        class={this.class}
        activePage={this.props.condition.map((value) => (value ? PageEnum.SwitchIf.True : PageEnum.SwitchIf.False))}
        pages={[
          [PageEnum.SwitchIf.False, <></>],
          [PageEnum.SwitchIf.True, this.props.on],
        ]}
      />
    );
  }
}
