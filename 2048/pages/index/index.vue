<template>
	<view class="game-content" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
		<text class="content-header">welcome to 2048 😅</text>
		<view class="content-main">
			<view class="main-row" v-for="(row, index) in gridData" :key="index">
				<view class="row-item" v-for="(item, index) in row" :class="itemClass[Math.log2(item) < 8 ? Math.log2(item) : 7]" :key="index">
					{{ item !== 0 ? item : '' }}
				</view>
			</view>
		</view>
		<text class="content-footer">HOW TO PLAY: Use your arrow keys to move the tiles. Tiles with the same number merge into one when they touch. Add them up to reach 2048!</text>
	</view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

interface IPosition {
	x: number;
	y: number;
}

const gridData = reactive<number[][]>([
	[0, 0, 2, 2],
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0]
]);
const start = reactive<IPosition>({ x: 0, y: 0 });
const end = reactive<IPosition>({ x: 0, y: 0 });
const validValue = ref(2);
const itemClass = ['', 'row-item-2', 'row-item-4', 'row-item-8', 'row-item-16', 'row-item-32', 'row-item-64', 'row-item-more'];
const isFull = computed(() => {
	return validValue.value === gridData.length * gridData[0].length;
});

function handleTouchStart(e: any) {
	start.x = parseInt(e.changedTouches[0].clientX);
	start.y = parseInt(e.changedTouches[0].clientY);
}

function handleTouchEnd(e: any) {
	end.x = parseInt(e.changedTouches[0].clientX);
	end.y = parseInt(e.changedTouches[0].clientY);
	handleMove(start, end);
}

function updateGridData(direct: 'up' | 'down' | 'left' | 'right') {
	const rows = gridData.length;
	const cols = gridData[0].length;

	/* 基线 */
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

	/* 下一个坐标 */
	const next = {
		up: (i: number, j: number) => [i + 1, j],
		down: (i: number, j: number) => [i - 1, j],
		left: (i: number, j: number) => [i, j - 1],
		right: (i: number, j: number) => [i, j + 1]
	};

	function _inRange(i: number, j: number) {
		return i >= 0 && i < rows && j >= 0 && j < cols;
	}

	function _nextNotZeroValue(i: number, j: number) {
		if (!_inRange(i, j)) return;
		let [nextI, nextJ] = next[direct](i, j);

		while (_inRange(nextI, nextJ)) {
			if (gridData[nextI][nextJ] !== 0) {
				return [nextI, nextJ, gridData[nextI][nextJ]];
			}
			[nextI, nextJ] = next[direct](nextI, nextJ);
		}
	}

	/**
	 * 以基准位置向某一方向扫描，并合并可合并项
	 */
	function _walk(i: number, j: number) {
		if (!_inRange(i, j)) return;
		/* 向某一方向获取非零项 */
		const res = _nextNotZeroValue(i, j);
		if (!res) return;

		const [nextI, nextJ, nextValue] = res;
		const currentValue = gridData[i][j];

		if (currentValue === 0) {
			/* 自身为 0 */
			gridData[i][j] = nextValue;
			gridData[nextI][nextJ] = 0;
			_walk(i, j);
		} else if (currentValue === nextValue) {
			/* 相同项 */
			gridData[i][j] *= 2;
			gridData[nextI][nextJ] = 0;
			/* 合法数减一 */
			validValue.value--;
			_walk(i, j);
		}

		[i, j] = next[direct](i, j);
		_walk(i, j);
	}

	/**
	 * 开始遍历基准线，并向各个方向扫描
	 * @param obj {startX - 基准X, startY - 基准Y, incre - 0,1 - 递增标志}
	 */
	function _start({ startX, startY, incre }: any) {
		if (incre) {
			while (startY < cols) _walk(startX, startY++);
		} else {
			while (startX < rows) _walk(startX++, startY);
		}
	}

	/**
	 * 随机生成范围内的整数
	 * @param min 最小值
	 * @param max 最大值
	 * @returns 范围内随机数
	 */
	function _getRandomInteger(min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	/**
	 * 随机生成 2/4
	 * @param rows 行数
	 * @param cols 行数
	 */
	function _randomOne(rows: number, cols: number) {
		if (isFull.value) return;
		const i = _getRandomInteger(0, rows - 1);
		const j = _getRandomInteger(0, cols - 1);
		const randomValue = _getRandomInteger(0, 100) % 2 == 0 ? 2 : 4;

		if (gridData[i][j] === 0) {
			gridData[i][j] = randomValue;
			validValue.value++;
			return;
		}

		_randomOne(rows, cols);
	}

	_start(startLine[direct]);
	_randomOne(rows, cols);
}

/**
 * 处理移动
 * @param start 起始位置
 * @param end 终点位置
 */
function handleMove(start: IPosition, end: IPosition) {
	const diffX = end.x - start.x;
	const diffY = end.y - start.y;

	const absDiffX = Math.abs(diffX);
	const absDiffY = Math.abs(diffY);

	if (absDiffX > absDiffY) {
		/* 左右 */
		/* 短距控制 */
		if (absDiffX < 50) return;
		if (diffX > 0) updateGridData('left');
		else updateGridData('right');
	} else {
		/* 上下 */
		if (absDiffY < 50) return;
		if (diffY > 0) updateGridData('down');
		else updateGridData('up');
	}
}
</script>

<style lang="less">
.game-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20px;
	padding: 20px;
	height: calc(100vh - 69px);

	.content-header {
		font-size: 20px;
		padding: 20px 0;
	}

	.content-main {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 10px;
		border-radius: 5px;
		background-color: rgb(187, 173, 160);

		.main-row {
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: 10px;

			.row-item {
				transition: all 0.2s;
				min-width: 50px;
				min-height: 50px;
				text-align: center;
				line-height: 50px;
				border-radius: 5px;
				background-color: rgb(205, 193, 180);
			}

			.row-item-2 {
				background-color: rgb(238, 225, 201);
			}

			.row-item-4 {
				background-color: rgb(238, 228, 218);
			}

			.row-item-8 {
				background-color: rgb(243, 178, 122);
			}

			.row-item-16 {
				background-color: rgb(246, 150, 100);
			}

			.row-item-32 {
				background-color: rgb(246, 150, 100);
			}

			.row-item-64 {
				background-color: rgb(247, 95, 59);
			}

			.row-item-more {
				background-color: rgb(237, 208, 115);
			}
		}
	}

	.content-footer {
		padding: 20px;
		font-size: 12px;
	}
}
</style>
