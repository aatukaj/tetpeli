
function outf(text) {
    addCmd(text.replace("\n", ""))
    console.log(text)
}

function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
        throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
}

function runit() {
    var prog = `
class Entity:
    def __init__(self,x, y):
        self.x=x
        self.y=y
        self.id=str(id(self))
        print(f"addEntity:{self.id},{x},{y}")
    def move(self, dir):
        print(f"move:{self.id},{dir}")
    def say(self, text):
        print(f"say:{self.id},{text}")

    \n` + editor.getValue();
    Sk.configure({
        output: outf,
        read: builtinRead
    });
    var myPromise = Sk.misceval.asyncToPromise(function () {
        return Sk.importMainWithBody("<stdin>", false, prog, true);
    });
    myPromise.then(function (mod) {
        console.log('success');
    },
        function (err) {
            console.log(err.toString());
        });
}
