let es_to_cjs = require('../../lib/impl/ImportExportResolver');
let { expect } = require('../nollup');
let path = require('path');

let tests = [{
    input: 'import Hello from \'./world\';',
    output: {
        code: '',
        imports: [{
            source: './world',
            importee: '_i0',
            specifiers: [{
                local: 'Hello',
                imported: 'default'
            }]
        }]
    }
}, {
    input: 'import \'./styles.css\';',
    output: {
        imports: [{
            source: './styles.css',
            importee: '_i0',
            specifiers: []
        }]
    }
}, {
    input: 'import {member} from "./file";',
    output: {
        imports: [{
            source: './file',
            importee: '_i0',
            specifiers: [{
                local: 'member',
                imported: 'member'
            }]
        }]
    }
}, {
    input: 'import { member } from "./file";',
    output: {
        imports: [{
            source: './file',
            importee: '_i0',
            specifiers: [{
                local: 'member',
                imported: 'member'
            }]
        }]
    }
}, {
    input: 'import {mem1, mem2} from "./file";',
    output: {
        imports: [{
            source: './file',
            importee: '_i0',
            specifiers: [{
                local: 'mem1',
                imported: 'mem1'
            }, {
                local: 'mem2',
                imported: 'mem2'
            }]
        }]
    }
}, {
    input: 'import {member as lol} from "./file";',
    output: {
        imports: [{
            source: './file',
            importee: '_i0',
            specifiers: [{
                local: 'lol',
                imported: 'member'
            }]
        }]
    }
}, {
    input: 'import * as lol from "./file";',
    output: {
        imports: [{
            source: './file',
            importee: '_i0',
            specifiers: [{
                local: 'lol',
                imported: '*'
            }]
        }]
    }
}, {
    input: 'import Hello, * as World from "./file";',
    output: {
        imports: [{
            source: './file',
            importee: '_i0',
            specifiers: [{
                local: 'Hello',
                imported: 'default'
            }, {
                local: 'World',
                imported: '*'
            }]
        }]
    }
}, {
    input: 'export default Hello;',
    output: {
        exports: ['default'],
        code: `__e__('default', Hello);`
    }
}, {
    input: 'export default 123;',
    output: {
        exports: ['default'],
        code: `__e__('default', 123);`
    }
}, {
    input: 'export default () => {};',
    output: {
        exports: ['default'],
        code: `__e__('default', () => {});`
    }
}, {
    input: 'export default (() => {});',
    output: {
        exports: ['default'],
        code: `__e__('default', (() => {}));`
    }
}, /* {
    input: 'export default(() => {});',
    output: 'module.exports.default = (() => {});'
},*/ {
    input: 'export default class Hello {};',
    output: {
        exports: ['default'],
        code: `class Hello {}; __e__('default', Hello);;`
    }
}, {
    input: 'export default class Hello {}',
    output: {
        exports: ['default'],
        code: `class Hello {}; __e__('default', Hello);`
    }
}, {
    input: 'export class Hello {};',
    output: {
        exports: ['Hello'],
        code: `class Hello {}; __e__('Hello', Hello);;`
    }
}, {
    input: 'export class Hello {}',
    output: {
        exports: ['Hello'],
        code: `class Hello {}; __e__('Hello', Hello);`
    }
}, {
    input: 'export function Hello () {};',
    output: {
        exports: ['Hello'],
        code: `function Hello () {}; __e__('Hello', Hello);;`
    }
}, {
    input: 'let name1 = 123, name2 = 456; export {name1, name2};',
    output: {
        exports: ['name1', 'name2'],
        code: `let name1 = 123, name2 = 456; __e__('name1', name1);__e__('name2', name2);`
    }
}, {
    input: 'let hello = 123, name = 456; export {hello as world, name};',
    output: {
        exports: ['world', 'name'],
        code: `let hello = 123, name = 456; __e__('world', hello);__e__('name', name);`
    }
}, {
    input: 'export var MyVar1 = 123;',
    output: {
        exports: ['MyVar1'],
        code: `var MyVar1 = 123;; __e__('MyVar1', MyVar1);`
    }
}, {
    input: 'export var MyVar1 = () => {}, MyVar2 = 456;',
    output: {
        exports: ['MyVar1', 'MyVar2'],
        code: `var MyVar1 = () => {}, MyVar2 = 456;; __e__('MyVar1', MyVar1), __e__('MyVar2', MyVar2);`
    }
}, {
    input: 'export var MyVar1 = () => {}, MyVar2 = 456',
    output: {
        exports: ['MyVar1', 'MyVar2'],
        code: `var MyVar1 = () => {}, MyVar2 = 456; __e__('MyVar1', MyVar1), __e__('MyVar2', MyVar2);`
    }
}, {
    input: 'export const MyVar1 = () => {}, MyVar2 = 456;',
    output: {
        exports: ['MyVar1', 'MyVar2'],
        code: `const MyVar1 = () => {}, MyVar2 = 456;; __e__('MyVar1', MyVar1), __e__('MyVar2', MyVar2);`
    }
}, {
    input: 'export { MyVar } from "./file"',
    output: {
        imports: [{
            source: './file',
            importee: '_i0',
            specifiers: [{
                local: 'ex_MyVar',
                imported: 'MyVar'
            }]
        }],
        exports: ['MyVar'],
        code: `__e__('MyVar', ex_MyVar);`
    }
}, {
    input: 'export { default } from "./file";',
    output: {
        imports: [{
            source: './file',
            importee: '_i0',
            specifiers: [{
                local: 'ex_default',
                imported: 'default'
            }]
        }],
        exports: ['default'],
        code: `__e__('default', ex_default);`
    }
}, {
    input: 'export * from "./file"',
    output: {
        imports: [{
            source: './file',
            importee: '_i0',
            specifiers: [{
                local: 'ex_i0',
                imported: '*'
            }]
        }],
        exports: [],
        code: `for(var __k__ in ex_i0){__k__ !== "default" && (__e__(__k__, ex_i0[__k__]))}`
    }
}, {
    input: 'import Hello from "hello";import World from "world";',
    output: {
        imports: [{
            source: 'hello',
            importee: '_i0',
            specifiers: [{
                local: 'Hello',
                imported: 'default'
            }]
        }, {
            source: 'world',
            importee: '_i1',
            specifiers: [{
                local: 'World',
                imported: 'default'
            }]
        }]
    }
}, {
    input: 'export const { foo, bar } = myvar;',
    output: {
        exports: ['foo', 'bar'],
        code: `const { foo, bar } = myvar;; __e__('foo', foo), __e__('bar', bar);`
    }
}, {
    input: 'export const { foo: hello, bar: world } = myvar;',
    output: {
        exports: ['hello', 'world'],
        code: `const { foo: hello, bar: world } = myvar;; __e__('hello', hello), __e__('world', world);`
    }
}, {
    input: 'export const { foo, bar } = myvar, hello = 123;',
    output: {
        exports: ['foo', 'bar', 'hello'],
        code: `const { foo, bar } = myvar, hello = 123;; __e__('foo', foo), __e__('bar', bar), __e__('hello', hello);`
    }
}];

describe ('es_to_cjs', () => {
    tests.forEach(test => {
        it(test.input, async () => {
             test.output = {
                code: '',
                imports: [],
                exports: [],
                dynamicImports: [],
                externalDynamicImports: [],
                ...test.output
            };

            let res = await es_to_cjs({ plugins: [] }, test.input, process.cwd() + '/__entry');
            let to_check = {};
            for (let key in test.output) {
                to_check[key] = res[key];
            }

            to_check.code = to_check.code.trim().replace(/\s+/g, ' ');

            test.output.imports = test.output.imports.map(dep => {
                dep.source = path.resolve(process.cwd(), dep.source + (!path.extname(dep.source)? '.js' : ''));
                return dep;
            });

            try {
                expect(to_check).to.deep.equal(test.output);
            } catch (e) {
                throw new Error(`
                    Expected: ${JSON.stringify(test.output)}
                    Actual: ${JSON.stringify(res)}
                `)
            }
        });
    })
});

let external_tests = [{
    input: 'import jQuery from "jquery";',
    output: {
        code: '',
        imports: [],
        externalImports: [{
            source: 'jquery',
            importee: '__nollup__external__jquery__',
            specifiers: [{
                local: 'jQuery',
                imported: 'default'
            }]
        }]
    },
    config: {
        external: ['jquery']
    }
}, {
    input: 'import $ from "jquery";',
    output: {
        code: '',
        imports: [],
        externalImports: [{
            source: 'jquery',
            importee: '__nollup__external__jquery__',
            specifiers: [{
                local: '$',
                imported: 'default'
            }]
        }]
    },
    config: {
        external: ['jquery']
    }
}, {
    input: 'import jquery from "jquery";',
    output: {
        code: '',
        imports: [],
        externalImports: [{
            source: 'jquery',
            importee: '__nollup__external__jquery__',
            specifiers: [{
                local: 'jquery',
                imported: 'default'
            }]
        }]
    },
    config: {
        external: ['jquery'],
        output: {
            globals: {
                'jquery': '$'
            }
        }
    }
}, {
    input: 'import { max } from "Math";',
    output: {
        code: '',
        imports: [],
        externalImports: [{
            source: 'Math',
            importee: '__nollup__external__Math__',
            specifiers: [{
                local: 'max',
                imported: 'max'
            }]
        }]
    },
    config: {
        external: ['Math']
    }
},{
    input: 'import { max, min } from "Math";',
    output: {
        code: '',
        imports: [],
        externalImports: [{
            source: 'Math',
            importee: '__nollup__external__Math__',
            specifiers: [{
                local: 'max',
                imported: 'max'
            }, {
                local: 'min',
                imported: 'min'
            }]
        }]
    },
    config: {
        external: ['Math']
    }
}, {
    input: 'import $, { ajax } from "jquery";',
    output: {
        code: '',
        imports: [],
        externalImports: [{
            source: 'jquery',
            importee: '__nollup__external__jquery__',
            specifiers: [{
                local: '$',
                imported: 'default'
            }, {
                local: 'ajax',
                imported: 'ajax'
            }]
        }]
    },
    config: {
        external: ['jquery']
    }
}, {
    input: 'import { ajax as net } from "jquery";',
    output: {
        code: '',
        imports: [],
        externalImports: [{
            source: 'jquery',
            importee: '__nollup__external__jquery__',
            specifiers: [{
                local: 'net',
                imported: 'ajax'
            }]
        }]
    },
    config: {
        external: ['jquery'],
        output: {
            globals: {
                'jquery': '$'
            }
        }
    }
}, {
    input: 'export { ajax } from "jquery";',
    output: {
        code: `__e__('ajax', ex_ajax);`,
        imports: [],
        exports: ['ajax'],
        externalImports: [{
            source: 'jquery',
            importee: '__nollup__external__jquery__',
            specifiers: [{
                local: 'ex_ajax',
                imported: 'ajax'
            }]
        }]
    },
    config: {
        external: ['jquery']
    }
}, {
    input: 'export { ajax } from "jquery";',
    output: {
        code: `__e__('ajax', ex_ajax);`,
        imports: [],
        exports: ['ajax'],
        externalImports: [{
            source: 'jquery',
            importee: '__nollup__external__jquery__',
            specifiers: [{
                local: 'ex_ajax',
                imported: 'ajax'
            }]
        }]
    },
    config: {
        external: ['jquery'],
        output: {
            globals: {
                'jquery': '$'
            }
        }
    }
}, {
    input: 'export { ajax as net} from "jquery";',
    output: {
        code: `__e__('net', ex_net);`,
        imports: [],
        exports: ['net'],
        externalImports: [{
            source: 'jquery',
            importee: '__nollup__external__jquery__',
            specifiers: [{
                local: 'ex_net',
                imported: 'ajax'
            }]
        }]
    },
    config: {
        external: ['jquery'],
        output: {
            globals: {
                'jquery': '$'
            }
        }
    }
}, {
    input: 'export * from "jquery";',
    output: {
        code: `for(var __k__ in ex__nollup__external__jquery__){__k__ !== "default" && (__e__(__k__, ex__nollup__external__jquery__[__k__]))}`,
        imports: [],
        exports: [],
        externalImports: [{
            source: 'jquery',
            importee: '__nollup__external__jquery__',
            specifiers: [{
                local: 'ex__nollup__external__jquery__',
                imported: '*'
            }]
        }]
    },
    config: {
        external: ['jquery']
    }
}, {
    input: 'export * from "jquery";',
    output: {
        code: `for(var __k__ in ex__nollup__external__jquery__){__k__ !== "default" && (__e__(__k__, ex__nollup__external__jquery__[__k__]))}`,
        imports: [],
        exports: [],
        externalImports: [{
            source: 'jquery',
            importee: '__nollup__external__jquery__',
            specifiers: [{
                local: 'ex__nollup__external__jquery__',
                imported: '*'
            }]
        }]
    },
    config: {
        external: ['jquery'],
        output: {
            globals: {
                'jquery': '$'
            }
        }
    }
}, {
    input: 'import { ajax } from "jquery";',
    output: {
        code: ``,
        imports: [],
        externalImports: [{
            source: 'jquery',
            importee: '__nollup__external__jquery__',
            specifiers: [{
                local: 'ajax',
                imported: 'ajax'
            }]
        }]
    },
    config: {
        external: id => /jquery/.test(id)
    }
}, {
    input: 'import { ajax } from "some/other/dep";',
    output: {
        code: ``,
        imports: [],
        externalImports: [{
            source: 'some/other/dep',
            importee: '__nollup__external__some_other_dep__',
            specifiers: [{
                local: 'ajax',
                imported: 'ajax'
            }]
        }]
    },
    config: {
        external: id => /some\/other\/dep/.test(id)
    }
}]



describe('es_to_cs_externals (ESM)', () => {
    external_tests.forEach(test => {
        it(test.input, async () => {
            let res = await es_to_cjs({
                ...test.config, 
                plugins: [],
                output: { ...test.config.output, format: 'esm' }
            }, test.input, process.cwd() + '/__entry');
            let to_check = {}; 

            for (let key in test.output) {
                to_check[key] = res[key];
            }

            to_check.code = to_check.code.trim().replace(/\s+/g, ' ');

            try {
                expect(to_check).to.deep.equal(test.output);
            } catch (e) {
                throw new Error(`
                    Expected: ${JSON.stringify(test.output)}
                    Actual: ${JSON.stringify(res)}
                `)
            }
        });
    })
});

describe('misc transform issues', () => {
    it ('should not fail on null nodes', async () => {
        let res = await es_to_cjs({ plugins: [] }, `
            import Hello from './World';
            let a = [1, 2, , 4];
        `,  process.cwd() + '/__entry');
        expect(res.code.indexOf('[1, 2, , 4]') > -1).to.be.true;
    });

    it ('should properly blank two imports without semi-colons', async () => {
        let res = await es_to_cjs({ plugins: [] }, [
            'import Hello from "hello"',
            'import World from "world"',
            'console.log(Hello, World)'
        ].join('\n'), process.cwd() + '/_entry');
        expect(res.code).to.equal([
            '                         ',
            '                         ',
            'console.log(Hello, World)'
        ].join('\n'));
    });

    it ('should properly blank two imports on the same line', async () => {
        let res = await es_to_cjs({ plugins: [] }, [
            'import Hello from "hello";import World from "world"',
            'console.log(Hello, World)'
        ].join('\n'), process.cwd() + '/_entry');
        expect(res.code).to.equal([
            '                                                   ',
            'console.log(Hello, World)'
        ].join('\n'));
    });


    it ('should properly blank imports that span multiple lines', async () => {
        let res = await es_to_cjs({ plugins: [] }, [
            'import {',
            '   Hello',
            '} from "hello";',
            'import {',
            '   World',
            '} from "world";',
            'console.log(Hello, World)'
        ].join('\n'), process.cwd() + '/_entry');
        expect(res.code).to.equal([
            '        ',
            '        ',
            '               ',
            '        ',
            '        ',
            '               ',
            'console.log(Hello, World)'
        ].join('\n'));
    });

    it ('should properly blank export {} blocks', async () => {
        let res = await es_to_cjs({ plugins: [] }, [
            'var Hello, World, Foo, Bar;',
            'export { Hello, World }',
            'export { Foo, Bar };',
            'console.log(Hello, World)'
        ].join('\n'), process.cwd() + '/_entry');
        expect(res.code).to.equal([
            'var Hello, World, Foo, Bar;',
            '                       __e__(\'Hello\', Hello);__e__(\'World\', World);',
            '                    __e__(\'Foo\', Foo);__e__(\'Bar\', Bar);',
            'console.log(Hello, World)'
        ].join('\n'));
    });

    it ('should properly blank export {} blocks over multiple lines with padding', async () => {
        let res = await es_to_cjs({ plugins: [] }, [
            'var Hello, World, Foo, Bar;',
            'export {                   ',
            '    Hello,                 ',
            '    World                  ',
            '}                          ',
            'console.log(Hello, World)'
        ].join('\n'), process.cwd() + '/_entry');
        expect(res.code).to.equal([
            'var Hello, World, Foo, Bar;',
            '                           ',
            '                           ',
            '                           ',
            ' __e__(\'Hello\', Hello);__e__(\'World\', World);                          ',
            'console.log(Hello, World)'
        ].join('\n'));
    });
});