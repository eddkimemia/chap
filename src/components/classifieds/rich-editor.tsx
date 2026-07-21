'use client'

import { MDXEditor, headingsPlugin, listsPlugin, toolbarPlugin, BoldItalicUnderlineToggles, ListsToggle, BlockTypeSelect } from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'

interface RichEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function RichEditor({ value, onChange }: RichEditorProps) {
  return (
    <div className="rich-editor-wrapper rounded-xl border border-slate-200 bg-white focus-within:border-royal/40 focus-within:ring-1 focus-within:ring-royal/10 transition-all overflow-hidden">
      <MDXEditor
        markdown={value}
        onChange={(v) => onChange(v)}
        plugins={[
          toolbarPlugin({
            toolbarContents: () => (
              <div className="flex items-center gap-0.5 p-1 border-b border-slate-100 bg-slate-50/50">
                <BlockTypeSelect />
                <div className="w-px h-5 bg-slate-200 mx-1" />
                <BoldItalicUnderlineToggles />
                <div className="w-px h-5 bg-slate-200 mx-1" />
                <ListsToggle />
              </div>
            ),
          }),
          headingsPlugin(),
          listsPlugin(),
        ]}
        contentEditableClassName="min-h-[180px] px-4 py-3 text-sm text-slate-700 outline-none prose prose-slate prose-sm max-w-none"
        spellCheck
      />
    </div>
  )
}
