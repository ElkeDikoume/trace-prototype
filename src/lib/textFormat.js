// Claude's document-generation responses use markdown bold (**text**) for
// emphasis, but Insights tab documents render in plain <textarea> elements
// that don't interpret markdown, so the asterisks would otherwise show up
// literally. Strip them before any AI-generated text is written into
// document state (chat bubbles render markdown properly via Chatbot.jsx's
// renderFormatted, so this must not be applied to chatHistory).
export function stripMarkdownBold(text) {
  return (text || '').replace(/\*\*(.*?)\*\*/g, '$1');
}
