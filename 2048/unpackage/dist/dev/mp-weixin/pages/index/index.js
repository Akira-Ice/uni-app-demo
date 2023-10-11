"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const gridData = common_vendor.reactive([
      [0, 0, 2, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]);
    const start = common_vendor.reactive({ x: 0, y: 0 });
    const end = common_vendor.reactive({ x: 0, y: 0 });
    const validValue = common_vendor.ref(2);
    const itemClass = ["", "row-item-2", "row-item-4", "row-item-8", "row-item-16", "row-item-32", "row-item-64", "row-item-more"];
    const isFull = common_vendor.computed(() => {
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
        } else if (currentValue === nextValue) {
          gridData[i][j] *= 2;
          gridData[nextI][nextJ] = 0;
          validValue.value--;
          _walk(i, j);
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
      _randomOne(rows, cols);
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
      return {
        a: common_vendor.f(gridData, (row, index, i0) => {
          return {
            a: common_vendor.f(row, (item, index2, i1) => {
              return {
                a: common_vendor.t(item !== 0 ? item : ""),
                b: common_vendor.n(itemClass[Math.log2(item) < 8 ? Math.log2(item) : 7]),
                c: index2
              };
            }),
            b: index
          };
        }),
        b: common_vendor.o(handleTouchStart),
        c: common_vendor.o(handleTouchEnd)
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "E:/Akira/2048/pages/index/index.vue"]]);
wx.createPage(MiniProgramPage);
