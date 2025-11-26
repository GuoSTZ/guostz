// 自定义元素
class InteractiveBlock extends HTMLElement {
  // 声明需要监听的属性名，只有这些属性变化时才会触发attributeChangedCallback
  static get observedAttributes() {
    return ['name', 'data']
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // 元素被插入到DOM时执行，此时去加载子应用的静态资源并渲染
    console.log('InteractiveBlock is connected')
  }

  disconnectedCallback() {
    // 元素从DOM中删除时执行，此时进行一些卸载操作
    console.log('InteractiveBlock has disconnected')
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    // 元素属性发生变化时执行，可以获取name等属性的值
    console.log(`attribute ${attr}: ${newVal} 类型：${typeof newVal}`);
    if (attr === 'data') {
      if (typeof newVal === 'string') {
        this._data = JSON.parse(newVal || '[]');
      }
      this.render();
    }
  }

  // 通过JS进行属性赋值时触发，例如dom.data = xxx，如果用setAttribute的方式，走的是attributeChangedCallback方法
  set data(array) {
    this._data = array;
    this.render();
  }

  get data() {
    return this._data || [];
  }

  createMainMenuItemTemplate(node = {}) {
    const template = document.createElement('template');
    const { text, children } = node;
    template.innerHTML = `
      <style>
        .main-menu-item {
          --size: 64px;

          position: relative;
          width: var(--size);
          height: var(--size);
          line-height: var(--size);
          text-align: center;
          border-radius: 50%;
          box-shadow: 2px 2px 2px 0 rgba(0, 0, 0, 0.2);
          cursor: pointer;
          user-select: none;
          transition: 0.2s;
        }
        .main-menu-item:not(last-child) {
          margin-bottom: 16px;
        }
        .main-menu-item:hover {
          background-color: #f9dc50;
        }
        .child-menu {
          display: none;
          position: absolute;
          top: 50%;
          left: calc( 100% + 16px );
          transform: translateY(-50%);
          text-align: left;
        }
        .main-menu-item:hover .child-menu {
          display: block;
        }
      </style>
      <div class="main-menu-item">
        ${text}
        <div class="child-menu"></div>
      </div>
    `;
    if (children instanceof HTMLElement) {
      const childMenu = template.content.querySelector('.child-menu');
      childMenu.appendChild(children);
    }
    return template.content.cloneNode(true);
  }

  render() {
    const data = this.data;
    const box = document.createElement('div');
    box.style = `
      margin-left: 200px;
      margin-top: 100px;
    `;
    if (data && Array.isArray(data) && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        const item = this.createMainMenuItemTemplate(data[i]);
        box.appendChild(item);
      }
    }
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(box);
  }
}

/**
 * 注册元素
 * 注册后，就可以像普通元素一样使用interactive-block，当interactive-block元素被插入或删除DOM时即可触发相应的生命周期函数。
 */
function defineElement(elementName, myElement) {
  // 如果已经定义过，则忽略
  if (!window.customElements.get(elementName)) {
    window.customElements.define(elementName, myElement)
  }
}

defineElement('interactive-block', InteractiveBlock);