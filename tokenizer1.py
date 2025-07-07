from functools import reduce
from itertools import chain


class Token(object):
    Name = 'name'
    Keyword = 'keyword'
    String = 'string'
    Number = 'number'
    Operator = 'operator'
    NewLine = 'newline'
    Regex = 'regex'
    EOF = '(end)'

    LITERALS = [String, Number, Regex]

    def __init__(self, source, type, line=0, char=0):
        self.value = source
        self.type = type
        #self.line = line
        #self.char = char

    def __repr__(self):
        return '<%s: %s>' % (self.type, self.value.replace('\n', '\\n'))
        #return '<%s: %s (line %d, char %d)>' % (self.type, self.value.replace('\n', '\\n'), self.line, self.char)

    def __str__(self):
        return self.value

class UnmatchedToken(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.error_message = message



def tokenize(stream):
    operators = ['>>>=', '>>=', '<<=', '%=', '/=', '*=', '+=', '-=', '===', '==', '!==', '...', '!=', '++', '--',
                 '>=', '<=', '&=', '|=', '^=', '&&', '||', '=>', '??', '&', '|', '^', '~', '!', '{', '[', ']', '}', '(',
                 ')', ':', '*', '/', '%', '+', '-', '?', '<', '>', ';', '=', ',', '.']
    keywords = ["namespace", "constructor", "await", "break", "case", "catch", "class", "const", "continue", "debugger",
                "default", "delete", "do", "else", "enum", "export", "extends", "false", "finally", "for", "function",
                "if", "implements", "import", "in", "instanceof", "interface", "let", "new", "null", "package",
                "private", "protected", "public", "return", "static", "super", "switch", "this", "throw", "true", "try",
                "typeof", "undefined", "var", "void", "while", "with", "yield"]

    in_comment = False
    in_string = False
    building_name = False
    escaped = False

    length = len(stream)
    skip = 0

    stri = []
    numrange = range(ord('0'), ord('9') + 1)
    octrange = range(ord('0'), ord('7') + 1)
    hexrange = chain(range(ord('a'), ord('f') + 1), range(ord('A'), ord('F') + 1), numrange)

    whitespace = [' ', '\n', '\t', '\r', '"', "'", "`"]
    get_operators_for = lambda c: list(filter(lambda x: ord(c) is ord(x[0]), operators))
    is_operator = lambda c: c is not None and any(get_operators_for(c))
    is_separator = lambda c: c is None or (c in whitespace or is_operator(c))
    is_number = lambda c: c is not None and ord(c) in numrange
    is_hexnumber = lambda c: c is not None and ord(c) in hexrange
    is_octnum = lambda c: c is not None and ord(c) in octrange
    tokens = []

    line = 1
    char = 0

    # round, curly, square
    brackets = [0, 0, 0]

    for idx, character in enumerate(stream):
        if character == '\n':
            line += 1
            char = 0
            if tokens[-1].type != Token.NewLine:
                if len(stri):
                    tokens.append(Token("".join(stri), Token.Name, char, line))
                    stri = []
                tokens.append(Token("", Token.NewLine, line, char))
        else:
            char += 1
        if skip:
            skip = skip - 1
            continue

        next = lambda i=1: idx + i < length and stream[idx + i] or None

        if in_comment:
            if escaped:
                escaped = False
                continue
            if character == '\\':
                escaped = True
            elif in_comment == '/*' and character == '*' and next() == '/':
                skip = 1
                stri = []
                in_comment = False
            elif in_comment == '//' and character == '\n':
                in_comment = False

        elif in_string:
            if escaped:
                escaped = False
                if character == 'x':
                    hex_0 = next()
                    hex_1 = next(1)
                    if hex_0 is None or hex_1 is None:
                        raise Exception("Unexpected EOF during hex parse")

                    try:
                        hex_0 = int(hex_0, 16) << 4
                        hex_1 = int(hex_1, 16)
                        stri.append(chr(hex_1 | hex_0))
                        skip = 2
                    except ValueError:
                        stri.append(character)
                        #stri.append(unicode(character))

                elif character == 'u':
                    hex_0 = next()
                    hex_1 = next(1)
                    hex_2 = next(2)
                    hex_3 = next(3)
                    if not all(reduce(lambda x: x is not None, [hex_0, hex_1, hex_2, hex_3])):
                        raise Exception("Unexpected EOF during unicode parse")
                    try:
                        hex = (int(hex_0, 16) << 12) | (int(hex_1, 16) << 8) | \
                              (int(hex_2, 16) << 4) | (int(hex_0, 16))
                        stri.append(chr(hex))
                        skip = 4
                    except ValueError:
                        stri.append(character)
                        #stri.append(unicode(character))
                elif character == '\\':
                    stri.append(u'\\')
                elif character == in_string:
                    stri.append(in_string)
                    #stri.append(unicode(in_string))
                else:
                    stri.append(character)
                    #stri.append(unicode(character))
            else:
                if character == '\\':
                    escaped = True
                elif character == in_string:
                    in_string = False
                    tokens.append(Token(u''.join(stri), Token.String, line, char))
                    stri = []
                else:
                    stri.append(character)
                    #stri.append(unicode(character))

        else:
            is_sep = is_separator(character)

            if not building_name and not is_sep:
                if is_number(character):

                    if character == '0':
                        if next() == 'x':
                            # build hex
                            skip = 2
                            c = next(skip)
                            while is_hexnumber(c):
                                stri.append(c)
                                skip += 1
                                c = next(skip)
                            skip -= 1
                            tokens.append(Token(u''.join(stri), Token.Number, line, char))
                            stri = []
                            continue

                        elif is_number(next(1)):
                            # build octal
                            skip = 0
                            c = next(skip)
                            is_octal = True
                            while is_number(c):
                                stri.append(c)
                                is_octal = is_octal and is_octnum(c)
                                skip += 1
                                c = next(skip)
                            skip -= 1
                            if not is_octal:
                                stri = stri[1:]
                            tokens.append(Token(u''.join(stri), Token.Number, line, char))
                            stri = []
                            continue

                    # build plain number
                    seen_e = False
                    seen_dot = False

                    skip = 0
                    okay = lambda: is_number(next(skip)) or (not seen_e and next(skip) == '.') or (
                                not seen_dot and next(skip).lower() == 'e')
                    while okay():
                        c = next(skip)
                        stri.append(c)
                        if c == '.':
                            seen_dot = True
                        elif c.lower() == 'e':
                            seen_e = True
                        skip += 1
                    skip -= 1
                    tokens.append(Token(u''.join(stri), Token.Number, line, char))
                    stri = []
                else:
                    building_name = True
                    stri.append(character)
            elif is_sep:
                ops = get_operators_for(character)

                if building_name:
                    building_name = False
                    ustr = u''.join(stri)
                    type = Token.Name
                    if ustr in keywords:
                        type = Token.Keyword
                    elif ustr == u'Infinity' or ustr == u'NaN':
                        type = Token.Number
                    elif type == Token.Name:
                        if tokens[-1].value in ["set", "get"]:
                            tokens[-1].type = Token.Keyword

                    tokens.append(Token(ustr, type, line, char))
                    stri = []

                if character == '/' and tokens[-1].type == Token.Operator:
                    in_regex = True
                    regex_escape = False
                    skip = 1
                    c = next(skip)
                    while (c != '/' or regex_escape):
                        if regex_escape:
                            stri.append('\\')
                            stri.append(c)
                            regex_escape = False
                        elif c == '\\':
                            regex_escape = True
                        elif c == '\n':
                            in_regex = False
                            break
                        else:
                            stri.append(c)
                        skip += 1
                        c = next(skip)

                    if len(stri) < 1:
                        in_regex = False
                        stri = []

                    if not in_regex:
                        skip = 0
                    else:
                        skip += 1
                        flags = []
                        c = next(skip)
                        while c in ['g', 'i', 'm', 'y']:
                            flags.append(c)
                            skip += 1
                            c = next(skip)
                        skip -= 1
                        stri.append('/')
                        stri = ['/'] + stri + flags
                        tokens.append(Token(u''.join(stri), Token.Regex, line, char))
                        stri = []
                        continue

                if character == '"' or character == "'" or character == "`":
                    in_string = character
                elif character == '/' and (next(1) == '/' or next(1) == '*'):
                    in_comment = character + next(1)
                elif character in ["(", "{", "["]:
                    brackets[["(", "{", "["].index(character)] +=1
                    tokens.append(Token(character, Token.Operator, line, char))
                elif character in [")", "}", "]"]:
                    brackets[[")", "}", "]"].index(character)] -= 1
                    tokens.append(Token(character, Token.Operator, line, char))

                else:
                    if len(ops):
                        for possibility in ops:
                            bad = False
                            for pidx, pchar in enumerate(possibility):
                                c = next(pidx)
                                if c != pchar:
                                    bad = True
                                    break
                            if not bad:
                                tokens.append(Token(possibility, Token.Operator, line, char))
                                skip = len(possibility) - 1
                                stri = []
                                break
            elif building_name:
                stri.append(character)

    tokens.append(Token('', Token.EOF, line, char))

    if any(brackets):
        raise UnmatchedToken("ERROR brackets not equal + " + str(brackets))

    return tokens