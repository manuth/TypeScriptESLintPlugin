import type ts = require("typescript/lib/tsserverlibrary");
import { Range } from "vscode-languageserver";
import { Constants } from "../Constants";
import { Plugin } from "../Plugin";
import { Configuration } from "../Settings/Configuration";
import { IDiagnostic } from "./IDiagnostic";
import { IParsedDiagnostic } from "./IParsedDiagnostic";

/**
 * Represents a diagnostic.
 */
export abstract class Diagnostic implements IDiagnostic
{
    /**
     * Gets the information related to the diagnostic.
     */
    public RelatedInformation?: ts.DiagnosticRelatedInformation[];

    /**
     * The plugin of the diagnostic.
     */
    private plugin: Plugin;

    /**
     * The category of the diagnostic.
     */
    private category: ts.DiagnosticCategory;

    /**
     * The source-file.
     */
    private file: ts.SourceFile;

    /**
     * Initializes a new instance of the {@link Diagnostic `Diagnostic`} class.
     *
     * @param plugin
     * The plugin of the diagnostic.
     *
     * @param file
     * The file of the diagnostic.
     *
     * @param category
     * The category of the diagnostic.
     */
    public constructor(plugin: Plugin, file: ts.SourceFile, category?: ts.DiagnosticCategory)
    {
        this.plugin = plugin;
        this.file = file;
        this.category = category ?? this.TypeScript.DiagnosticCategory.Warning;
    }

    /**
     * Gets the plugin of the diagnostic.
     */
    public get Plugin(): Plugin
    {
        return this.plugin;
    }

    /**
     * Gets the typescript server.
     */
    public get TypeScript(): typeof ts
    {
        return this.Plugin.TypeScript;
    }

    /**
     * Gets the configuration of the plugin.
     */
    public get Config(): Configuration
    {
        return this.Plugin.Config;
    }

    /**
     * Gets the source of the diagnostic.
     */
    public get Source(): string
    {
        return Constants.ErrorSource;
    }

    /**
     * Gets the code of the error.
     */
    public get Code(): number
    {
        return Constants.ErrorCode;
    }

    /**
     * Gets the category of the diagnostic.
     */
    public get Category(): ts.DiagnosticCategory
    {
        return this.category;
    }

    /**
     * Gets the source-file.
     */
    public get File(): ts.SourceFile
    {
        return this.file;
    }

    /**
     * Gets the range containing the error.
     */
    public get Range(): Range
    {
        return {
            start: {
                line: 0,
                character: 0
            },
            end: {
                line: 0,
                character: 0
            }
        };
    }

    /**
     * Gets the message of the diagnostic.
     */
    public abstract get Message(): string | ts.DiagnosticMessageChain;

    /**
     * Gets the parsed representation of the diagnostic.
     */
    public get Parsed(): IParsedDiagnostic<this>
    {
        let start = this.ResolvePosition(this.Range.start.line, this.Range.start.character);
        let end = this.ResolvePosition(this.Range.end.line, this.Range.end.character);

        return {
            category: this.Category,
            source: this.Source,
            code: this.Code,
            file: this.File,
            start,
            length: end - start,
            messageText: this.Message,
            ...(
                this.RelatedInformation ?
                    { relatedInformation: this.RelatedInformation } :
                    {}),
            origin: this
        };
    }

    /**
     * Resolves the position of the specified  {@link line `line`}- and {@link column `column`}-number.
     *
     * @param line
     * The line to resolve.
     *
     * @param column
     * The column to resolve.
     *
     * @returns
     * A number representing the text-position.
     */
    protected ResolvePosition(line: number, column: number): number
    {
        let result: number;

        if (line !== null && line !== undefined)
        {
            let lineStarts = this.File.getLineStarts();

            if (line < lineStarts.length)
            {
                let lineStart = lineStarts[line];
                let lineEnd = this.File.getLineEndOfPosition(lineStart);

                if (isNaN(lineEnd))
                {
                    lineEnd = 0;
                }

                if (column !== null && column !== undefined)
                {
                    if (column <= (this.File.getLineEndOfPosition(lineStart) - lineStart))
                    {
                        result = this.File.getPositionOfLineAndCharacter(line, column);
                    }
                    else
                    {
                        result = lineEnd;
                    }
                }
            }
            else
            {
                result = this.File.getLineEndOfPosition(lineStarts[lineStarts.length - 1]);
            }
        }
        else
        {
            result = null;
        }

        return result;
    }
}
