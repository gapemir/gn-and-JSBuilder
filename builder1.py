#chat and mine try of tokenizer and builder in same file
#it didnt word

indent_string = "   "
operators = ["+", "-", "*", "/", "%", "="]
keywords = [ "await", "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "enum", "export", "extends", "false", "finally", "for", "function", "if", "implements", "import", "in", "instanceof", "interface", "let", "new", "null", "package", "private", "protected", "public", "return", "static", "super", "switch", "this", "throw", "true", "try", "typeof", "var", "void", "while", "with", "yield" ]


def build(files: list[str], out, runDir):
    namespaces: list[str] = []

    with (open(runDir+".bdata/tmp", "w", encoding='utf-8') as fout):
        for filename in files:
            code: str = ""
            i: int = 0

            tokens = []
            with open(runDir+filename, "r", encoding='utf-8') as fin:
                code = fin.read()
            n = len(code)
            while i < len(code):
                c = code[i]
                if c.isspace():
                    i+=1
                    continue
                if c == '/' and i + 1 < len(code):
                    next_char = code[i + 1]
                    if next_char == '/':  # Single-line comment
                        while i < len(code) and code[i] != '\n':
                            i += 1
                        continue
                    elif next_char == '*':  # Multi-line comment
                        i += 2
                        while i + 1 < len(code) and not (code[i] == '*' and code[i + 1] == '/'):
                            i += 1
                        i += 2
                        continue

                if c.isalpha() or c == '_':
                    identifier = ""
                    while i < n and (code[i].isalnum() or code[i] == '_'):
                        identifier += code[i]
                        i += 1
                    tokens.append({'type': 'identifier', 'value': identifier})
                    continue
                # Handle other single-character tokens (operators, punctuators)
                tokens.append({'type': 'symbol', 'value': c})
                i += 1

            classes = []
            formatted_code = ""
            indentation_level = 0
            curNamespace = ""

        return ""

            i = 0
            while i < len(tokens) -1:
                token = tokens[i]
                if token['type'] == 'identifier' and token['value'] == "namespace":
                    i += 1
                    while i < len(tokens) and tokens[i]['value'] != "{":
                        curNamespace += tokens[i]['value']
                        i += 1
                    namespaces.append(curNamespace)
                    i+=1
                    continue

                elif token['type'] == 'identifier' and token['value'] == 'class':
                    if i + 1 < len(tokens) and tokens[i + 1]['type'] == 'identifier':
                        class_name = tokens[i + 1]['value']
                        classes.append(class_name)
                        formatted_code += indent_string * indentation_level + f"{curNamespace}.{class_name} = class "
                        i += 2
                    else:
                        print("ERROR with classes")
                        return 1
                    continue
                elif token['type'] == 'identifier' and token['value'] == "for":
                    while i < len(tokens) and tokens[i-1]['value'] != ")":
                        if token[i]['value'] == ";":
                            formatted_code += ";"
                        else:
                            formatted_code, indentation_level = write_common_token(token, formatted_code, indentation_level, tokens[i])
                        #formatted_code += tokens[i]['value'] + " "
                        i += 1
                    continue
                formatted_code, indentation_level = write_common_token(token, formatted_code, indentation_level, tokens[i])
                i += 1

            fout.write(formatted_code)


        print(classes)
    return

def write_common_token(token:dict[str:str], formatted_code, indentation_level, nextToken:dict[str:str]):
    if token['type'] == 'symbol' and token['value'] == '{':
        indentation_level += 1
        formatted_code += "{\n" + indent_string * indentation_level

    elif token['type'] == 'symbol' and token['value'] == '}':
        indentation_level -= 1
        formatted_code = formatted_code.rstrip(
        " ") + indent_string * indentation_level + "}\n" + indent_string * indentation_level
    elif token['type'] == 'symbol' and token['value'] == ';':
        formatted_code = formatted_code.rstrip(" ") + ";\n" + indent_string * indentation_level
    elif token['value'] == '(' or token['value'] == ',':
        formatted_code = formatted_code.rstrip(" ") + token['value'] + " "
    elif token['value'] == '.':
        formatted_code = formatted_code.rstrip(" ") + "."
    elif token['value'] in operators:
        if nextToken['value'] in operators:
            formatted_code += token['value'] + nextToken['value'] + " "
        else:
            formatted_code += token['value'] + " "
    else:
        formatted_code += token['value'] + (" " if token['type'] == 'identifier' else "")
    return formatted_code, indentation_level


"""
    while i < n:
        char = code[i]

        # Skip whitespace
        if char.isspace():
            i += 1
            continue

        # Handle comments
        if char == '/' and i + 1 < n:
            next_char = code[i + 1]
            if next_char == '/':  # Single-line comment
                while i < n and code[i] != '\n':
                    i += 1
                continue
            elif next_char == '*':  # Multi-line comment
                i += 2
                while i + 1 < n and not (code[i] == '*' and code[i + 1] == '/'):
                    i += 1
                i += 2
                continue

        # Identify potential keywords or identifiers
        if char.isalpha() or char == '_':
            identifier = ""
            while i < n and (code[i].isalnum() or code[i] == '_'):
                identifier += code[i]
                i += 1
            tokens.append({'type': 'identifier', 'value': identifier})
            continue

        # Handle other single-character tokens (operators, punctuators)
        tokens.append({'type': 'symbol', 'value': char})
        i += 1

    classes = []
    formatted_code = ""
    indentation_level = 0
    indent_string = "    "  # You can adjust the indentation

    i = 0
    while i < len(tokens):
        token = tokens[i]

        if token['type'] == 'identifier' and token['value'] == 'class':
            class_name = ""
            # Look for the class name (the next identifier)
            if i + 1 < len(tokens) and tokens[i + 1]['type'] == 'identifier':
                class_name = tokens[i + 1]['value']
                classes.append(class_name)
                formatted_code += indent_string * indentation_level + f"class {class_name} "
                i += 2  # Skip 'class' and the class name
            else:
                formatted_code += indent_string * indentation_level + "class "
                i += 1
            continue

        elif token['type'] == 'symbol' and token['value'] == '{':
            formatted_code += "{\n"
            indentation_level += 1
        elif token['type'] == 'symbol' and token['value'] == '}':
            indentation_level -= 1
            formatted_code += indent_string * indentation_level + "}\n"
        elif token['type'] == 'symbol' and token['value'] == ';':
            formatted_code += ";\n" + indent_string * indentation_level
        else:
            formatted_code += token['value'] + (" " if token['type'] == 'identifier' else "")

        i += 1

    return classes, formatted_code.strip()
"""
# Example usage:
js_code = """
// This is a single-line comment
/*
This is a
multi-line comment
*/

class MyClass {
    constructor(name) {
        this.name = name;
    }

    greet() {
        console.log(`Hello, ${this.name}!`);
    }
}

class AnotherClass{
  methodA() {
    // Do something
  }
}
"""

#found_classes, formatted_js = build1(js_code)
#print("Found Classes:", found_classes)
#print("\nFormatted Code:\n", formatted_js)