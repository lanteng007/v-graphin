// const defaultComboTheme = {
//   primaryComboColor: '#FF6A00',
//   comboSize: 20,
//   mode: 'light',
// };
const getComboStyleByTheme = () =>
  // inputTheme: ComboTheme
  {
    // const { comboSize, primaryComboColor, mode } = {
    //   ...defaultEdgeTheme,
    //   ...inputTheme,
    // };

    // const Colors = {
    //   light: {
    //     stroke: primaryComboColor,
    //     label: primaryComboColor,
    //     disabled: '#ddd',
    //   },
    //   dark: {
    //     stroke: primaryComboColor,
    //     label: primaryComboColor,
    //     disabled: '#ddd3',
    //   },
    // };
    // const Color = Colors[mode];

    const defaultStyle = {
      type: 'circle',
      style: {
        labelCfg: {
          position: 'top',
        },
      },
      status: {},
    };
    return defaultStyle;
  };

export default getComboStyleByTheme;
