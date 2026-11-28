// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string'], importedStringConstants: ''};
  return new CompiledApp(
      await _compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string'], importedStringConstants: ''};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

let _isCompileStreamingSupported;
async function _compileStreaming(source, builtins) {
  _isCompileStreamingSupported ??= WebAssembly.compileStreaming(
    new Response(
      new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,2,23,1,14,119,97,115,109,58,106,115,45,115,116,114,105,110,103,4,99,97,115,116,0,0]),
      {headers: {'Content-Type': 'application/wasm'}},
    ),
    builtins,
  ).then(() => false, (e) => e instanceof WebAssembly.CompileError);
  if (await _isCompileStreamingSupported) {
    return WebAssembly.compileStreaming(source, builtins);
  }
  return WebAssembly.compile(await (await source).arrayBuffer(), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            AB: x0 => new Int16Array(x0),
      AC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      AD: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      AE: (x0,x1) => { x0.textContent = x1 },
      AF: x0 => x0.identifier,
      AG: (x0,x1) => x0.querySelectorAll(x1),
      AH: (x0,x1) => x0.writeText(x1),
      AI: x0 => x0.deref(),
      AJ: x0 => x0.result,
      AK: (x0,x1) => { x0.scrollLeft = x1 },
      B: s => printToConsole(s),
      BB: x0 => new Uint16Array(x0),
      BC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      BD: x0 => x0.tabIndex,
      BE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      BF: x0 => x0.touches,
      BG: (x0,x1) => x0.requestAnimationFrame(x1),
      BH: x0 => x0.unlock(),
      BI: () => globalThis.WeakRef,
      BJ: x0 => x0.length,
      BK: (x0,x1) => { x0.spellcheck = x1 },
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: x0 => new Int32Array(x0),
      CC: (x0,x1) => x0.querySelector(x1),
      CD: (x0,x1) => x0.contains(x1),
      CE: x0 => x0.matches,
      CF: x0 => x0.pressure,
      CG: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CH: (x0,x1) => x0.lock(x1),
      CI: () => new AbortController(),
      CJ: x0 => x0.files,
      CK: (x0,x1) => { x0.disabled = x1 },
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      DC: (x0,x1) => x0.item(x1),
      DD: x0 => x0.activeElement,
      DE: (x0,x1) => x0.matchMedia(x1),
      DF: x0 => x0.tiltY,
      DG: x0 => x0.now(),
      DH: x0 => x0.orientation,
      DI: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      DJ: (x0,x1) => { x0.display = x1 },
      DK: (x0,x1) => x0.getRandomValues(x1),
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: x0 => new Uint32Array(x0),
      EC: x0 => x0.length,
      ED: x0 => x0.parentNode,
      EE: x0 => x0.matches,
      EF: x0 => x0.tiltX,
      EG: x0 => x0.performance,
      EH: (x0,x1) => x0.querySelector(x1),
      EI: (x0,x1) => globalThis.fetch(x0,x1),
      EJ: x0 => x0.style,
      EK: () => globalThis.crypto,
      F: () => new Error().stack,
      FB: x0 => new Float32Array(x0),
      FC: (x0,x1) => x0.querySelectorAll(x1),
      FD: x0 => x0.tagName,
      FE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      FF: x0 => x0.pointerType,
      FG: (d, digits) => d.toFixed(digits),
      FH: (x0,x1) => { x0.title = x1 },
      FI: (x0,x1) => x0.get(x1),
      FJ: (x0,x1) => { x0.accept = x1 },
      FK: l => new DataView(new ArrayBuffer(l)),
      G: s => JSON.stringify(s),
      GB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      GC: (x0,x1) => x0.getAttribute(x1),
      GD: x0 => x0.target,
      GE: f => f.dartFunction,
      GF: x0 => x0.pointerId,
      GG: x0 => x0.maxHeight,
      GH: (x0,x1) => x0.vibrate(x1),
      GI: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      GJ: (x0,x1) => { x0.multiple = x1 },
      GK: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9) => x0.drawImage(x1,x2,x3,x4,x5,x6,x7,x8,x9),
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: x0 => new Float64Array(x0),
      HC: x0 => x0.remove(),
      HD: x0 => x0.clientY,
      HE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      HF: x0 => x0.getCoalescedEvents(),
      HG: x0 => x0.maxWidth,
      HH: x0 => x0.arrayBuffer(),
      HI: (x0,x1) => x0.forEach(x1),
      HJ: (x0,x1) => { x0.draggable = x1 },
      HK: (x0,x1) => x0.getContext(x1),
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      IC: (x0,x1) => x0.appendChild(x1),
      ID: x0 => x0.clientX,
      IE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      IF: s => s.trimLeft(),
      IG: x0 => x0.minHeight,
      IH: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      II: x0 => x0.name,
      IJ: (x0,x1) => { x0.type = x1 },
      IK: (x0,x1) => { x0.height = x1 },
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: x0 => new ArrayBuffer(x0),
      JC: (x0,x1) => x0.append(x1),
      JD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      JE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      JF: (x0,x1) => x0[x1],
      JG: x0 => x0.minWidth,
      JH: x0 => x0.status,
      JI: x0 => x0.statusText,
      JJ: (a, l) => a.length = l,
      JK: (x0,x1) => { x0.width = x1 },
      K: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      KB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      KC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      KD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      KE: (o, i) => o[i],
      KF: x0 => x0.index,
      KG: (x0,x1) => x0.removeProperty(x1),
      KH: (x0,x1) => x0.fetch(x1),
      KI: x0 => x0.url,
      KJ: (a, i) => a.splice(i, 1)[0],
      KK: (x0,x1) => x0.transferFromImageBitmap(x1),
      L: o => o === undefined,
      LB: (x0,x1,x2) => new DataView(x0,x1,x2),
      LC: x0 => x0.style,
      LD: (x0,x1) => x0.closest(x1),
      LE: o => o.length,
      LF: s => s.toUpperCase(),
      LG: (x0,x1) => x0.add(x1),
      LH: x0 => x0.content,
      LI: x0 => x0.status,
      LJ: x0 => x0.hardwareConcurrency,
      LK: x0 => x0.rasterEndMilliseconds,
      M: o => String(o),
      MB: (o, p) => o[p],
      MC: x0 => x0.debugShowSemanticsNodes,
      MD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      ME: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      MF: x0 => x0.flags,
      MG: x0 => x0.data,
      MH: x0 => x0.document,
      MI: x0 => x0.cancel(),
      MJ: x0 => x0.userAgent,
      MK: x0 => x0.rasterStartMilliseconds,
      N: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      NB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      NC: o => o,
      ND: (handle) => clearTimeout(handle),
      NE: x0 => x0.language,
      NF: (a, s) => a.join(s),
      NG: (x0,x1) => x0.removeAttribute(x1),
      NH: () => typeof dartUseDateNowForTicks !== "undefined",
      NI: x0 => x0.getReader(),
      NJ: x0 => x0.navigator,
      NK: x0 => x0.imageBitmaps,
      O: (x0,x1) => x0.didCreateEngineInitializer(x1),
      OB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      OC: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      OD: x0 => x0.maxTouchPoints,
      OE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      OF: (x0,x1) => x0.error(x1),
      OG: (x0,x1) => { x0.value = x1 },
      OH: () => Date.now(),
      OI: x0 => x0.read(),
      OJ: x0 => x0.close(),
      OK: x0 => x0.canvasKitMaximumSurfaces,
      P: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PB: o => o.byteOffset,
      PC: (x0,x1) => x0.warn(x1),
      PD: x0 => x0.platform,
      PE: () => globalThis.window.FinalizationRegistry,
      PF: () => globalThis.console,
      PG: (x0,x1) => { x0.value = x1 },
      PH: () => 1000 * performance.now(),
      PI: x0 => x0.value,
      PJ: (o, p, v) => o[p] = v,
      PK: x0 => x0.hostElement,
      Q: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      QB: o => o.buffer,
      QC: x0 => x0.console,
      QD: s => new Date(s * 1000).getTimezoneOffset() * 60,
      QE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      QF: s => s.trimRight(),
      QG: x0 => x0.value,
      QH: x0 => new Uint8Array(x0),
      QI: x0 => x0.done,
      QJ: x0 => x0.height,
      QK: x0 => x0.location,
      R: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      RB: Function.prototype.call.bind(DataView.prototype.getUint8),
      RC: () => globalThis.window,
      RD: Date.now,
      RE: x0 => new window.FinalizationRegistry(x0),
      RF: x0 => x0.blur(),
      RG: x0 => x0.selectionDirection,
      RH: (x0,x1,x2) => x0.slice(x1,x2),
      RI: x0 => x0.body,
      RJ: x0 => x0.width,
      RK: (x0,x1) => x0.getModifierState(x1),
      S: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      SB: (b, o) => new DataView(b, o),
      SC: (o, c) => o instanceof c,
      SD: (x0,x1) => x0.contains(x1),
      SE: (x0,x1) => x0.unregister(x1),
      SF: x0 => x0.button,
      SG: x0 => x0.selectionStart,
      SH: (x0,x1) => x0.decode(x1),
      SI: x0 => x0.headers,
      SJ: (x0,x1,x2,x3,x4,x5) => x0.createImageBitmap(x1,x2,x3,x4,x5),
      SK: x0 => x0.metaKey,
      T: x0 => new Promise(x0),
      TB: (b, o, l) => new DataView(b, o, l),
      TC: (x0,x1) => x0.exec(x1),
      TD: (decoder, codeUnits) => decoder.decode(codeUnits),
      TE: x0 => x0.preventDefault(),
      TF: (x0,x1) => x0.prepend(x1),
      TG: x0 => x0.selectionEnd,
      TH: (x0,x1) => x0.adoptText(x1),
      TI: x0 => x0.signal,
      TJ: (x0,x1,x2) => x0.createImageBitmap(x1,x2),
      TK: x0 => x0.altKey,
      U: (x0,x1,x2) => x0.call(x1,x2),
      UB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      UC: x0 => x0.length,
      UD: () => new TextDecoder("utf-8", {fatal: true}),
      UE: x0 => x0.parent,
      UF: x0 => x0.parentElement,
      UG: x0 => x0.value,
      UH: x0 => x0.first(),
      UI: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      UJ: (x0,x1) => x0.createImageBitmap(x1),
      UK: x0 => x0.ctrlKey,
      V: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      VB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      VC: (x0,x1) => { x0.lastIndex = x1 },
      VD: () => new TextDecoder("utf-8", {fatal: false}),
      VE: x0 => x0.timeStamp,
      VF: x0 => x0.innerHeight,
      VG: x0 => x0.selectionDirection,
      VH: x0 => x0.next(),
      VI: x0 => x0.pop(),
      VJ: x0 => new Blob(x0),
      VK: x0 => x0.isComposing,
      W: x0 => new Array(x0),
      WB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      WC: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      WD: (a, i, v) => a[i] = v,
      WE: (x0,x1) => x0.hasAttribute(x1),
      WF: x0 => x0.innerWidth,
      WG: x0 => x0.selectionStart,
      WH: x0 => x0.current(),
      WI: (x0,x1) => x0.createElement(x1),
      WJ: x0 => x0.close(),
      WK: x0 => x0.code,
      X: o => [o],
      XB: (t, s) => t.set(s),
      XC: o => o instanceof RegExp,
      XD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      XE: x0 => x0.type,
      XF: x0 => x0.height,
      XG: x0 => x0.selectionEnd,
      XH: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      XI: (x0,x1) => x0.appendChild(x1),
      XJ: x0 => x0.naturalHeight,
      XK: x0 => x0.repeat,
      Y: (o0, o1) => [o0, o1],
      YB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      YC: (string, times) => string.repeat(times),
      YD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      YE: (x0,x1) => x0.getModifierState(x1),
      YF: x0 => x0.width,
      YG: (x0,x1) => { x0.name = x1 },
      YH: x0 => x0.v8BreakIterator,
      YI: x0 => x0.click(),
      YJ: x0 => x0.naturalWidth,
      YK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      Z: (o0, o1, o2) => [o0, o1, o2],
      ZB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      ZC: x0 => x0.dotAll,
      ZD: (s) => +s,
      ZE: x0 => x0.buttons,
      ZF: x0 => x0.clientHeight,
      ZG: (x0,x1) => { x0.placeholder = x1 },
      ZH: () => globalThis.Intl,
      ZI: x0 => x0.remove(),
      ZJ: (x0,x1) => { x0.src = x1 },
      ZK: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      a: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      aB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      aC: x0 => x0.unicode,
      aD: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      aE: x0 => x0.ctrlKey,
      aF: x0 => x0.clientWidth,
      aG: (x0,x1) => { x0.autocomplete = x1 },
      aH: (x0,x1) => x0.segment(x1),
      aI: x0 => x0.body,
      aJ: x0 => x0.displayHeight,
      aK: (x0,x1) => x0.getItem(x1),
      b: (x0,x1,x2) => { x0[x1] = x2 },
      bB: Function.prototype.call.bind(DataView.prototype.getUint32),
      bC: x0 => x0.ignoreCase,
      bD: s => s.trim(),
      bE: x0 => x0.getBoundingClientRect(),
      bF: x0 => x0.isConnected,
      bG: (x0,x1) => { x0.type = x1 },
      bH: x0 => x0.index,
      bI: (x0,x1) => { x0.download = x1 },
      bJ: x0 => x0.displayWidth,
      bK: x0 => x0.localStorage,
      c: o => o,
      cB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      cC: x0 => x0.multiline,
      cD: x0 => x0.classList,
      cE: x0 => x0.y,
      cF: x0 => x0.head,
      cG: (x0,x1) => { x0.name = x1 },
      cH: x0 => x0.next(),
      cI: (x0,x1) => { x0.href = x1 },
      cJ: x0 => x0.duration,
      cK: (x0,x1) => x0.key(x1),
      d: (o, p) => o[p],
      dB: Function.prototype.call.bind(DataView.prototype.getInt32),
      dC: (string, token) => string.split(token),
      dD: x0 => x0.relatedTarget,
      dE: x0 => x0.x,
      dF: (x0,x1) => { x0.content = x1 },
      dG: (x0,x1) => { x0.placeholder = x1 },
      dH: x0 => x0.value,
      dI: () => globalThis.document,
      dJ: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      dK: x0 => x0.length,
      e: () => globalThis,
      eB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      eC: o => o instanceof Array,
      eD: x0 => x0.hasFocus(),
      eE: x0 => x0.top,
      eF: (x0,x1) => { x0.name = x1 },
      eG: (x0,x1) => { x0.scrollTop = x1 },
      eH: x0 => x0.done,
      eI: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      eJ: (x0,x1) => x0.decode(x1),
      eK: (x0,x1) => x0.removeItem(x1),
      f: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      fB: o => o instanceof Uint16Array,
      fC: (a, i) => a[i],
      fD: x0 => x0.shiftKey,
      fE: x0 => x0.left,
      fF: (x0,x1) => x0.removeChild(x1),
      fG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      fH: (o, m, a) => o[m].apply(o, a),
      fI: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      fJ: x0 => x0.image,
      fK: (x0,x1,x2) => x0.setItem(x1,x2),
      g: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      gB: Function.prototype.call.bind(DataView.prototype.getUint16),
      gC: a => a.length,
      gD: x0 => x0.body,
      gE: x0 => x0.scrollTop,
      gF: x0 => x0.firstChild,
      gG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      gH: x0 => x0.iterator,
      gI: (a, s, e) => a.slice(s, e),
      gJ: x0 => x0.close(),
      gK: (x0,x1) => x0.querySelector(x1),
      h: (x0,x1) => ({addView: x0,removeView: x1}),
      hB: o => o instanceof Int16Array,
      hC: (x0,x1) => x0.test(x1),
      hD: x0 => x0.visibilityState,
      hE: x0 => x0.offsetTop,
      hF: x0 => x0.viewConstraints,
      hG: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      hH: () => globalThis.Symbol,
      hI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      hJ: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      hK: (x0,x1) => { x0.id = x1 },
      i: (l, r) => l === r,
      iB: Function.prototype.call.bind(DataView.prototype.getInt16),
      iC: x0 => x0.userAgent,
      iD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      iE: x0 => x0.scrollLeft,
      iF: x0 => x0.hostElement,
      iG: x0 => x0.keyCode,
      iH: (x0,x1) => new Intl.Segmenter(x0,x1),
      iI: (x0,x1,x2) => x0.addEventListener(x1,x2),
      iJ: x0 => new window.ImageDecoder(x0),
      iK: x0 => x0.extraAssets,
      j: x0 => x0.random(),
      jB: o => o instanceof Uint8ClampedArray,
      jC: x0 => x0.navigator,
      jD: (a, l) => a.length = l,
      jE: x0 => x0.offsetLeft,
      jF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jG: (x0,x1) => x0.scrollIntoView(x1),
      jH: x0 => x0.Segmenter,
      jI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jJ: x0 => x0.name,
      jK: x0 => x0.fontManifest,
      k: o => o,
      kB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      kC: Function.prototype.call.bind(String.prototype.toLowerCase),
      kD: x0 => x0.disconnect(),
      kE: x0 => x0.offsetParent,
      kF: x0 => ({runApp: x0}),
      kG: x0 => x0.multiViewEnabled,
      kH: x0 => x0.buffer,
      kI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      kJ: x0 => x0.repetitionCount,
      kK: x0 => x0.assetManifest,
      l: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      lB: Function.prototype.call.bind(DataView.prototype.setInt32),
      lC: Object.is,
      lD: x0 => new Intl.Locale(x0),
      lE: x0 => x0.offsetY,
      lF: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      lG: (x0,x1) => x0.replaceWith(x1),
      lH: x0 => x0.wasmMemory,
      lI: (x0,x1) => x0.removeChild(x1),
      lJ: x0 => x0.frameCount,
      lK: x0 => x0.buildConfig,
      m: () => globalThis.Math,
      mB: Function.prototype.call.bind(DataView.prototype.setUint32),
      mC: x0 => x0.vendor,
      mD: x0 => x0.region,
      mE: x0 => x0.offsetX,
      mF: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      mG: (x0,x1) => { x0.className = x1 },
      mH: () => globalThis.window._flutter_skwasmInstance,
      mI: (o, a) => o + a,
      mJ: x0 => x0.selectedTrack,
      mK: x0 => x0.length,
      n: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      nB: Function.prototype.call.bind(DataView.prototype.setInt16),
      nC: (x0,x1) => x0.createTextNode(x1),
      nD: x0 => x0.script,
      nE: (o, p, r) => o.replace(p, () => r),
      nF: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      nG: (x0,x1) => { x0.tabIndex = x1 },
      nH: () => new TextDecoder(),
      nI: x0 => x0.children,
      nJ: x0 => x0.completed,
      nK: x0 => x0.getReader(),
      o: b => !!b,
      oB: Function.prototype.call.bind(DataView.prototype.setUint16),
      oC: (x0,x1) => { x0.id = x1 },
      oD: x0 => x0.language,
      oE: (o, p, r) => o.replaceAll(p, () => r),
      oF: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      oG: (x0,x1) => { x0.action = x1 },
      oH: (map, o, v) => map.set(o, v),
      oI: x0 => x0.firstChild,
      oJ: x0 => x0.ready,
      oK: x0 => x0.value,
      p: () => globalThis.document,
      pB: Function.prototype.call.bind(DataView.prototype.setUint8),
      pC: (x0,x1) => { x0.nonce = x1 },
      pD: x0 => x0.languages,
      pE: x0 => x0.deltaMode,
      pF: x0 => x0.history,
      pG: (x0,x1) => { x0.method = x1 },
      pH: (map, o) => map.get(o),
      pI: () => globalThis.window,
      pJ: x0 => x0.tracks,
      pK: x0 => x0.done,
      q: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qB: Function.prototype.call.bind(DataView.prototype.setInt8),
      qC: x0 => x0.nonce,
      qD: (x0,x1) => x0.observe(x1),
      qE: x0 => x0.deltaY,
      qF: x0 => x0.search,
      qG: (x0,x1) => { x0.noValidate = x1 },
      qH: () => new WeakMap(),
      qI: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      qJ: () => globalThis.window.ImageDecoder,
      qK: x0 => x0.read(),
      r: (x0,x1) => x0.focus(x1),
      rB: Function.prototype.call.bind(DataView.prototype.getInt8),
      rC: () => globalThis.window.flutterConfiguration,
      rD: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      rE: x0 => x0.deltaX,
      rF: x0 => x0.location,
      rG: x0 => x0.click(),
      rH: x0 => x0.debugSkipFontRetryDelay,
      rI: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      rJ: (x0,x1,x2) => x0.insertBefore(x1,x2),
      rK: x0 => x0.body,
      s: () => ({}),
      sB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      sC: (x0,x1) => x0.attachShadow(x1),
      sD: x0 => new ResizeObserver(x0),
      sE: x0 => x0.wheelDeltaY,
      sF: x0 => x0.pathname,
      sG: (x0,x1) => x0.getElementsByClassName(x1),
      sH: (x0,x1,x2) => x0.set(x1,x2),
      sI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      sJ: x0 => x0.id,
      sK: (x0,x1) => new OffscreenCanvas(x0,x1),
      t: (o, p, v) => o[p] = v,
      tB: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      tC: (x0,x1) => x0.createElement(x1),
      tD: (x0,x1) => x0.getPropertyValue(x1),
      tE: x0 => x0.wheelDeltaX,
      tF: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      tG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      tH: x0 => x0.fontFallbackBaseUrl,
      tI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tJ: x0 => x0.offsetHeight,
      tK: x0 => x0.assetBase,
      u: () => [],
      uB: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      uC: x0 => x0.scale,
      uD: x0 => globalThis.parseFloat(x0),
      uE: x0 => x0.bottom,
      uF: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      uG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      uH: (handle) => clearInterval(handle),
      uI: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      uJ: x0 => x0.offsetWidth,
      uK: x0 => x0.loader,
      v: (a, i) => a.push(i),
      vB: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      vC: x0 => x0.visualViewport,
      vD: (x0,x1) => x0.getComputedStyle(x1),
      vE: x0 => x0.right,
      vF: o => Object.keys(o),
      vG: (x0,x1) => x0.dispatchEvent(x1),
      vH: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      vI: (x0,x1) => x0.item(x1),
      vJ: x0 => x0.stopPropagation(),
      vK: () => globalThis._flutter,
      w: x0 => new Int8Array(x0),
      wB: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      wC: x0 => x0.devicePixelRatio,
      wD: x0 => x0.documentElement,
      wE: x0 => x0.clientY,
      wF: x0 => x0.state,
      wG: (x0,x1) => x0.createEvent(x1),
      wH: () => Date.now(),
      wI: () => new FileReader(),
      wJ: x0 => x0.disabled,
      x: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      xB: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      xC: x0 => x0.height,
      xD: x0 => x0.computedStyleMap(),
      xE: x0 => x0.clientX,
      xF: x0 => x0.hash,
      xG: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      xH: (a, i) => a.splice(i, 1),
      xI: (x0,x1) => x0.readAsArrayBuffer(x1),
      xJ: (x0,x1) => { x0.min = x1 },
      y: x0 => new Uint8Array(x0),
      yB: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      yC: x0 => x0.width,
      yD: (x0,x1) => x0.get(x1),
      yE: x0 => x0.changedTouches,
      yF: x0 => x0.state,
      yG: x0 => x0.readText(),
      yH: a => a.pop(),
      yI: x0 => x0.size,
      yJ: (x0,x1) => { x0.max = x1 },
      z: x0 => new Uint8ClampedArray(x0),
      zB: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      zC: x0 => x0.screen,
      zD: (o, p) => p in o,
      zE: x0 => x0.key,
      zF: (x0,x1) => x0.go(x1),
      zG: x0 => x0.clipboard,
      zH: x0 => new WeakRef(x0),
      zI: x0 => x0.name,
      zJ: (x0,x1) => { x0.disabled = x1 },

    };

    const baseImports = {
      _: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
