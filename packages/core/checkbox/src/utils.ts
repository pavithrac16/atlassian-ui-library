export const identity = <T>(p: T): T => p;
export function createExtender<
  DefaultType extends Record<string, any>,
  OverridesType extends Record<string, any>
>(
  defaults: DefaultType,
  /** We're defaulting to an Object.create call here to circumvent
   *  the fact that {} can't be reconciled
   *  with a type that extends Record<string, any> */
  overrides: OverridesType = Object.create(Object.prototype),
) {
  return function getOverrides(key: string) {
    const {
      cssFn: defaultCssFn,
      attributesFn: defaultAttributesFn,
      component: defaultComponent,
    }: DefaultType[keyof DefaultType] = defaults[key];
    if (!overrides[key]) {
      return {
        cssFn: defaultCssFn,
        attributesFn: defaultAttributesFn,
        component: defaultComponent,
      };
    }
    const {
      cssFn: customCssFn,
      attributesFn: customAttributesFn,
      component: customComponent,
    } = overrides[key];
    const composedCssFn = <State>(state: State) => {
      return customCssFn(defaultCssFn(state), state);
    };
    return {
      cssFn: customCssFn ? composedCssFn : defaultCssFn,
      attributesFn: customAttributesFn || defaultAttributesFn,
      component: customComponent || defaultComponent,
    };
  };
}
