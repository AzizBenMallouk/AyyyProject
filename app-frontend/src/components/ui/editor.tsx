"use client";

import React, { useEffect, useRef, useState } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import { cn } from "@/lib/utils";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Checklist from "@editorjs/checklist";
import Code from "@editorjs/code";
import Quote from "@editorjs/quote";
import Table from "@editorjs/table";
import Delimiter from "@editorjs/delimiter";
import Warning from "@editorjs/warning";

interface EditorProps {
    data?: OutputData;
    onChange?: (data: OutputData) => void;
    holder: string;
    readOnly?: boolean;
}

export default function Editor({ data, onChange, holder, readOnly }: EditorProps) {
    const ref = useRef<EditorJS | null>(null);

    useEffect(() => {
        if (!ref.current) {
            const editor = new EditorJS({
                holder: holder,
                readOnly: readOnly,
                tools: {
                    header: Header,
                    list: List,
                    checklist: Checklist,
                    code: Code,
                    quote: Quote,
                    table: Table,
                    delimiter: Delimiter,
                    warning: Warning,
                },
                data: data,
                async onChange(api) {
                    if (!readOnly && onChange) {
                        const data = await api.saver.save();
                        onChange(data);
                    }
                },
            });
            ref.current = editor;
        }

        return () => {
            if (ref.current && ref.current.destroy) {
                ref.current.destroy();
                ref.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div id={holder} className={cn("prose prose-invert max-w-none min-h-[150px] bg-white/5 p-4 rounded-md border border-white/10", readOnly && "pointer-events-none")} />;
}
