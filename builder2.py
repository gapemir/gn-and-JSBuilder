import datetime

from builder import VERSION
from tokenizer1 import Token, tokenize


def build(file: str, runDir, src):
    formated = ""
    code = ""
    tokens = []
    with open(runDir + src + file, "r", encoding='utf-8') as fin:
        code = fin.read()
    tokens = tokenize(code)
    #print(tokens)
    i = 0
    currNamespace = ""
    indent = 0
    indentString = "    "
    bClassicFor = False
    bSwitch = False
    bClass = False
    while i < len(tokens):
        token = tokens[i]
        prevToken = tokens[i-1]
        if token.type == Token.Keyword:
            if token.value == "namespace":
                i+=1
                currNamespace = ""
                while tokens[i].type != Token.Operator or tokens[i].value != "{":
                    currNamespace += tokens[i].value
                    i+=1
                i+=1 #skip namespace {
                continue
            elif token.value == "class":
                formated += currNamespace + "." + tokens[i+1].value + " = class " + currNamespace.replace(".", "_") + "_" + tokens[i+1].value + " "
                bClass = True
                i+=2
                continue
            elif token.value == "for":
                bClassicFor = True
                formated += token.value
            elif token.value == "case" or token.value == "default":
                bSwitch = True
                formated += token.value + " "
            elif token.value == "break" and bSwitch:
                bSwitch = False
                indent -= 1
                formated += token.value + " "
            else:
                formated += token.value + " "

        elif token.type == Token.Operator:
            if token.value == "{":
                if tokens[i+1].value == "}":
                    formated = formated.strip() + "{}"
                    i+=2
                    continue
                else:
                    indent+=1
                    formated += "{\n" + indentString * indent
            elif token.value == "}":
                indent-=1
                if indent == 0:
                    bClass = False
                if tokens[i+1].type == Token.EOF:#skip last } from namespace
                    i+=1
                    continue
                formated = formated.rstrip() + "\n" + indentString * indent + "}"
                if tokens[i+1].value != ")":
                    formated += "\n" + indentString * indent
            elif token.value == ";":
                if bClassicFor:
                    formated = formated.strip() + "; "
                else:
                    if indent == 0:
                        bClass = False
                    formated = formated.rstrip() + ";\n" + indentString*indent
            elif token.value in ["...", "!"]: #right operators
                formated += token.value
            elif token.value in ["++", "--"]: #left and right operators
                if prevToken.type == Token.Name:
                    formated = formated.strip() + token.value + " "
                else:
                    formated += token.value
            elif token.value in [","]: #left operators
                formated = formated.rstrip() + token.value + " "
            elif token.value == ".":
                formated = formated.rstrip() + "."
            elif token.value == "(":
                if tokens[i+1].value == ")":
                    formated = formated.rstrip() + token.value
                else:
                    formated = formated.rstrip() + token.value + " "
            elif token.value == ")":
                bClassicFor = False
                formated += token.value + " "
            elif token.value == "[" and tokens[i+1].value == "]":
                formated = formated.rstrip() + " " + token.value
            elif token.value == "=":
                formated += "= "
            elif token.value == ":" and bSwitch:
                indent+=1
                formated += token.value + "\n" + indentString * indent
            else:
                formated += token.value + " "
        elif token.type == Token.Name:
            if indent == 0 and not bClass:
                formated += currNamespace + "." + token.value + " "
                bClass = True
            else:
                formated += token.value + " "
        elif token.type == Token.NewLine:
            if prevToken.value != ";":
                if indent == 0:
                    bClass = False
                if prevToken.type == Token.Name:
                    formated = formated.strip() + ";\n" + indentString * indent
                else:
                    formated = formated.strip() + "\n" + indentString * indent
        elif token.type == Token.String:
            if "\"" in token.value:
                token.value = token.value.replace("\"", "\\\"")
            if "${" in token.value and "}" in token.value:
                formated += "`" + token.value + "` "
            else:
                formated += "\"" + token.value + "\" "
        elif token.type == Token.Number:
            formated += token.value + " "
        else:
            pass #only EOF
        i+=1
    return formated, currNamespace
