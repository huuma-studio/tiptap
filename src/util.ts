/** Tagged template literal that returns its content as a plain CSS string. */
export function css(content: TemplateStringsArray): string {
  return content.join("");
}
