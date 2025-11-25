/**
 * @param {string} rawStyles
 */
export default (rawStyles) => {
  const styles = new CSSStyleSheet();
  styles.replaceSync(rawStyles);
  return styles;
};
