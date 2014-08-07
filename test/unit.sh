#!/bin/ksh

#http://eradman.com/posts/ut-shell-scripts.html
typeset -i tests_run=0
function try { this="$1"; }
trap 'printf "$0: exit code $? on line $LINENO\nFAIL: $this\n"; exit 1' ERR
function assert {
        let tests_run+=1
        [ "$1" = "$2" ] && { echo -n "."; return; }
        printf "\nFAIL: $this\n'$1' != '$2'\n"; exit 1
}

try "Oblacik"

assert "`node ./cli.js echo abc`" "abc"
assert "`node ./cli.js 'cat test/file.txt | grep empty'`" "Not empty file"
assert "`node ./cli.js 'cat test/file.txt|grep empty'`" "Not empty file"
assert "`node ./cli.js 'cat test/file.txt>test/file.txt.out'`" ""
assert "`node ./cli.js 'echo -n aa;echo -n bb'`" "aabb"

echo; echo "PASS: $tests_run tests run"