
let output = ""
function outf(text) {
    var mypre = document.getElementById("output");
    output += text;
}

function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
        throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
}

function runit() {
    var prog = editor.getValue();
    output = ""
    Sk.configure({
        output: outf,
        read: builtinRead
    });
    var myPromise = Sk.misceval.asyncToPromise(function () {
        return Sk.importMainWithBody("<stdin>", false, prog, true);
    });
    myPromise.then(function (mod) {
        console.log('success');
        beginMoving(output)
    },
        function (err) {
            console.log(err.toString());
        });
}
