// Declaraciones de tipo para archivos CSS (importaciones de efectos secundarios)
declare module '*.css' {
  const content: Record<string, string>
  export default content
}
