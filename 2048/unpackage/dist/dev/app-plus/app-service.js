if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const _sfc_main$1 = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    setup(__props) {
      const gridData = vue.reactive([
        [0, 0, 2, 2],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]);
      const start = vue.reactive({ x: 0, y: 0 });
      const end = vue.reactive({ x: 0, y: 0 });
      const validValue = vue.ref(2);
      const itemClass = ["", "row-item-2", "row-item-4", "row-item-8", "row-item-16", "row-item-32", "row-item-64", "row-item-more"];
      const isFull = vue.computed(() => {
        return validValue.value === gridData.length * gridData[0].length;
      });
      function handleTouchStart(e) {
        start.x = parseInt(e.changedTouches[0].clientX);
        start.y = parseInt(e.changedTouches[0].clientY);
      }
      function handleTouchEnd(e) {
        end.x = parseInt(e.changedTouches[0].clientX);
        end.y = parseInt(e.changedTouches[0].clientY);
        handleMove(start, end);
      }
      function updateGridData(direct) {
        const rows = gridData.length;
        const cols = gridData[0].length;
        const startLine = {
          up: {
            startX: 0,
            startY: 0,
            incre: 1
          },
          down: {
            startX: rows - 1,
            startY: 0,
            incre: 1
          },
          left: {
            startX: 0,
            startY: cols - 1,
            incre: 0
          },
          right: {
            startX: 0,
            startY: 0,
            incre: 0
          }
        };
        const next = {
          up: (i, j) => [i + 1, j],
          down: (i, j) => [i - 1, j],
          left: (i, j) => [i, j - 1],
          right: (i, j) => [i, j + 1]
        };
        function _inRange(i, j) {
          return i >= 0 && i < rows && j >= 0 && j < cols;
        }
        function _nextNotZeroValue(i, j) {
          if (!_inRange(i, j))
            return;
          let [nextI, nextJ] = next[direct](i, j);
          while (_inRange(nextI, nextJ)) {
            if (gridData[nextI][nextJ] !== 0) {
              return [nextI, nextJ, gridData[nextI][nextJ]];
            }
            [nextI, nextJ] = next[direct](nextI, nextJ);
          }
        }
        function _walk(i, j) {
          if (!_inRange(i, j))
            return;
          const res = _nextNotZeroValue(i, j);
          if (!res)
            return;
          const [nextI, nextJ, nextValue] = res;
          const currentValue = gridData[i][j];
          if (currentValue === 0) {
            gridData[i][j] = nextValue;
            gridData[nextI][nextJ] = 0;
            _walk(i, j);
            _randomOne(rows, cols);
          } else if (currentValue === nextValue) {
            gridData[i][j] *= 2;
            gridData[nextI][nextJ] = 0;
            validValue.value--;
            _walk(i, j);
            _randomOne(rows, cols);
          }
          [i, j] = next[direct](i, j);
          _walk(i, j);
        }
        function _start({ startX, startY, incre }) {
          if (incre) {
            while (startY < cols)
              _walk(startX, startY++);
          } else {
            while (startX < rows)
              _walk(startX++, startY);
          }
        }
        function _getRandomInteger(min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        function _randomOne(rows2, cols2) {
          if (isFull.value)
            return;
          const i = _getRandomInteger(0, rows2 - 1);
          const j = _getRandomInteger(0, cols2 - 1);
          const randomValue = _getRandomInteger(0, 100) % 2 == 0 ? 2 : 4;
          if (gridData[i][j] === 0) {
            gridData[i][j] = randomValue;
            validValue.value++;
            return;
          }
          _randomOne(rows2, cols2);
        }
        _start(startLine[direct]);
      }
      function handleMove(start2, end2) {
        const diffX = end2.x - start2.x;
        const diffY = end2.y - start2.y;
        const absDiffX = Math.abs(diffX);
        const absDiffY = Math.abs(diffY);
        if (absDiffX > absDiffY) {
          if (absDiffX < 50)
            return;
          if (diffX > 0)
            updateGridData("left");
          else
            updateGridData("right");
        } else {
          if (absDiffY < 50)
            return;
          if (diffY > 0)
            updateGridData("down");
          else
            updateGridData("up");
        }
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock(
          "view",
          {
            class: "game-content",
            onTouchstart: handleTouchStart,
            onTouchend: handleTouchEnd
          },
          [
            vue.createElementVNode("text", { class: "content-header" }, "welcome to 2048 😅"),
            vue.createElementVNode("view", { class: "content-main" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(gridData, (row, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "main-row",
                    key: index
                  }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(row, (item, index2) => {
                        return vue.openBlock(), vue.createElementBlock(
                          "view",
                          {
                            class: vue.normalizeClass(["row-item", itemClass[Math.log2(item) < 8 ? Math.log2(item) : 7]]),
                            key: index2
                          },
                          vue.toDisplayString(item !== 0 ? item : ""),
                          3
                          /* TEXT, CLASS */
                        );
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            vue.createElementVNode("text", { class: "content-footer" }, " HOW TO PLAY: Use your arrow keys to move the tiles. Tiles with the same number merge into one when they touch. Add them up to reach 2048! ")
          ],
          32
          /* HYDRATE_EVENTS */
        );
      };
    }
  });
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__file", "E:/Akira/2048/pages/index/index.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "E:/Akira/2048/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
