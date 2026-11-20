# MJ Chips

A phone-friendly replacement for mahjong chips: it replaces the "MJ Chip Replacer" Excel sheet.
Four players are set up at the start of the night, and each hand is recorded with a few taps.
The app keeps running totals, a night summary and a "who pays whom" settle-up.

## Use

Open `index.html` in a browser, or host the folder on GitHub Pages
(Settings → Pages → deploy from this branch, root folder). It is a static app with no build step.
Data is saved in the browser's local storage on that device.

1. **Set up:** enter the 4 names, pick the rate (0.3 / 0.6, 0.1 / 0.2 or Custom) and set the 杠 and 暗杠 amounts (they default to the 1 台 rates).
2. **Record:** pick what happened, then the winner, who threw the tile and the 台. Check the preview, then tap **Add hand**.
3. **History:** edit or delete any entry. Totals recalculate.
4. **Summary:** shows per-player counts for the night and the settle-up payments. **End night** saves the night under Past nights.

## Rules (same as the spreadsheet)

| Event | Payment |
|---|---|
| Win (discard) | Thrower pays the 2nd rate for the 台, the other two pay the 1st rate |
| 自摸 (zi mo) | All three pay the 2nd rate |
| 杠 (gang) / 暗杠 (an gang) | All three pay the night's 杠 / 暗杠 amount |
| 包 (bao) | Thrower alone pays 2 × 1st + 2nd at 5 台 |
| 包 Limit | Thrower alone pays 3 × 2nd at 5 台 |
| 诈胡 (zha hu) | Offender pays each other player the 2nd rate at 5 台 |

## Tests

`node test/calc.test.js` replays all 45 rows of the original spreadsheet (v2.6) and checks every result and the final totals.
