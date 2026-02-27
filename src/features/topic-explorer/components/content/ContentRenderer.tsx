import {
  parseContentBlocks,
  renderInlineBold,
  CALLOUT_STYLES,
} from "./content-utils";

interface ContentRendererProps {
  content: string;
}

export function ContentRenderer({ content }: ContentRendererProps) {
  const blocks = parseContentBlocks(content);

  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === "callout" && block.calloutKind) {
          const style =
            CALLOUT_STYLES[block.calloutKind] ?? CALLOUT_STYLES.DEFINITION;
          return (
            <div
              key={i}
              className={`my-4 rounded-lg border ${style.border} ${style.bg} p-4`}
            >
              <div
                className={`mb-2 text-xs font-bold uppercase tracking-wider ${style.labelColor}`}
              >
                {style.label}
              </div>
              <div className="text-[0.9375rem] leading-7">
                {renderInlineBold(block.content)}
              </div>
            </div>
          );
        }

        if (block.type === "code") {
          return (
            <pre
              key={i}
              className="bg-muted my-3 overflow-x-auto rounded-lg p-4 font-mono text-[0.8125rem] leading-6"
            >
              {block.content}
            </pre>
          );
        }

        return (
          <p key={i} className="text-base leading-7 whitespace-pre-wrap">
            {renderInlineBold(block.content)}
          </p>
        );
      })}
    </>
  );
}
