# 0.2.18-alpha (2020-10-30)

### Lock Dependencies

- **@jiaminghi/c-render:** lock `^0.4.3`.

# 0.2.17-alpha (2020-07-02)

### Bug Fixes

- **numberText:** Fix: When rendering, 0 is ignored.

# 0.2.16-alpha (2020-06-16)

### Perfect

- **numberText:** Add number formatter.

# 0.2.15-alpha (2020-05-06)

### Perfect

- **pie:** Optimization percent calculation.

# 0.2.14-alpha (2020-05-02)

### Perfect

- **numberText:** Graph of numberText support `\n` to **line feed**.

# 0.2.13-alpha (2020-04-15)

### Perfect

- **Axis:** Perfect axis calculation of min & max.

# 0.2.12-alpha (2020-01-15)

### Perfect

- **Pie:** Optimized percentage accuracy calculation.

# 0.2.11-alpha (2020-01-05)

### Bug Fixes

- **util->deepMerge:** Object property references are the same in some cases.

# 0.2.10-alpha (2019-12-25)

### Bug Fixes

- **Pie:** `PercentToFixed` exception display.

# 0.2.9-alpha (2019-11-26)

### Perfect

- **Bar:** Bar supports independent color, each bar can be set in different colors.
  ```javascript
  const config = {
    someConfig,
    series: [
      {
        type: 'bar',
        /**
         * @description Independent color mode
         * When set to true, independent color mode is enabled
         * @type {Boolean}
         * @default independentColor = false
         */
        independentColor: true,
        /**
         * @description Independent colors
         * Only effective when independent color mode is enabled
         * Default value is the same as the color in the root configuration
         * Two-dimensional color array can produce gradient colors
         * @type {Array}
         * @example independentColor = ['#fff', '#000']
         * @example independentColor = [['#fff', '#000'], '#000']
         */
        independentColors: [],
      }
    ]
  }
  ```

# 0.2.8-alpha (2019-10-24)

### Perfect

- **setOption:** **setOption** adds the `animationEnd` parameter which skips unfinished animation when updating the chart state. It is recommended to enable animationEnd when frequently updating the chart state (frequently updating the chart state may cause the animation data to continue to grow and cause memory leaks).
  ```javascript
  /**
   * @description Set chart option
   * @param {Object} option Chart option
   * @param {Boolean} animationEnd Execute animationEnd
   * @return {Undefined} No return
   */
  Charts.prototype.setOption = function (option, animationEnd = false) {
  }
  ```

# 0.2.7-alpha (2019-09-03)

### Perfect

- **axis:** Optimize irregular syntax.

# 0.2.6-alpha (2019-09-03)

### Perfect

- **axis:** Optimize irregular syntax.

# 0.2.5-alpha (2019-08-29)

### Perfect

- **babel:** Upgrade babel compilation mode.

# 0.2.4-alpha (2019-08-28)

### Perfect

- **babel:** Upgrade babel compilation mode.

# 0.2.3-alpha (2019-08-28)

### Bug Fixes

- **deepMerge:** deepMerge method cannot merge `Array` when recursive.

# 0.2.2-alpha (2019-06-13)

### Bug Fixes

- **axis:** The label position is abnormal when the label is rotated.
- **gauge:** An exception caused by inconsistent number of gradient colors.

# 0.2.1-alpha (2019-06-13)

### Perfect

- **core:** Configurable render level.

# 0.2.0-alpha (2019-06-13)

### New

- **legend:** Add legend extend.

# 0.1.3-alpha (2019-06-11)

### Bug Fixes

- **bar:** An exception caused by calculate gradientParams.

# 0.1.2-alpha (2019-06-11)

### Bug Fixes

- **axis:** An exception caused by calculate inteval.

# 0.1.1-alpha (2019-06-11)

### Perfect

- **core:** Optimize the update process.

- **config:** Add a function of `changeDefaultConfig` to change the default configuration.

- **ES5:** Use babel to transcode to `ES5`.

# 0.1.0-alpha (2019-06-05)

### New

- **gauge:** Add `gauge` chart.

### Perfect

- **Core:** Optimize the update process.

# 0.0.4-alpha (2019-05-31)

### Perfect

- **Perfect:** Some optimization.

# 0.0.3-alpha (2019-05-30)

### Bug Fixes

- **pie:** Abnormal calculation of radius under `roseType: true`.

# 0.0.2-alpha (2019-05-30)

### Perfect

- **pie:** Optimized Label `formatter`.

- **pie:** Add the `roseSort` configuration.

# 0.0.1-alpha (2019-05-30)

### Perfect

- **prototype:** Add prototype function `resize`.

# 0.0.0-alpha (2019-05-29)

### Release

- **alpha:** First beta with `line`,`bar`,`pie`,`radar` charts.