
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function (Ledger) {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.57.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\lib\components\Estuary.svelte generated by Svelte v3.57.0 */

    const { console: console_1 } = globals;
    const file_1 = "src\\lib\\components\\Estuary.svelte";

    // (80:0) {#if error}
    function create_if_block_1(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let p;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Error";
    			t1 = space();
    			p = element("p");
    			t2 = text(/*error*/ ctx[5]);
    			add_location(h1, file_1, 81, 4, 2958);
    			add_location(p, file_1, 82, 4, 2978);
    			attr_dev(div, "class", "m-4 my-auto text-red-400");
    			add_location(div, file_1, 80, 0, 2914);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*error*/ 32) set_data_dev(t2, /*error*/ ctx[5]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(80:0) {#if error}",
    		ctx
    	});

    	return block;
    }

    // (86:0) {#if response}
    function create_if_block(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let p;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Response";
    			t1 = space();
    			p = element("p");
    			t2 = text(/*response*/ ctx[3]);
    			add_location(h1, file_1, 87, 4, 3078);
    			add_location(p, file_1, 88, 4, 3101);
    			attr_dev(div, "class", "m-4 mt-8 my-auto w-full flex-wrap");
    			add_location(div, file_1, 86, 0, 3025);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*response*/ 8) set_data_dev(t2, /*response*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(86:0) {#if response}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div5;
    	let h10;
    	let t1;
    	let h11;
    	let t3;
    	let div0;
    	let label0;
    	let t5;
    	let input0;
    	let t6;
    	let div1;
    	let label1;
    	let t8;
    	let input1;
    	let t9;
    	let div2;
    	let label2;
    	let t11;
    	let input2;
    	let t12;
    	let div3;
    	let label3;
    	let t14;
    	let input3;
    	let t15;
    	let div4;
    	let button;
    	let t17;
    	let t18;
    	let if_block1_anchor;
    	let mounted;
    	let dispose;
    	let if_block0 = /*error*/ ctx[5] && create_if_block_1(ctx);
    	let if_block1 = /*response*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Upload a file to IPFS";
    			t1 = space();
    			h11 = element("h1");
    			h11.textContent = `${/*pathToFile*/ ctx[6]}`;
    			t3 = space();
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "File:";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "File Name:";
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "File Hash:";
    			t11 = space();
    			input2 = element("input");
    			t12 = space();
    			div3 = element("div");
    			label3 = element("label");
    			label3.textContent = "File Size:";
    			t14 = space();
    			input3 = element("input");
    			t15 = space();
    			div4 = element("div");
    			button = element("button");
    			button.textContent = "Upload";
    			t17 = space();
    			if (if_block0) if_block0.c();
    			t18 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			add_location(h10, file_1, 52, 4, 1781);
    			add_location(h11, file_1, 53, 4, 1817);
    			attr_dev(label0, "for", "file");
    			attr_dev(label0, "class", "mr-4");
    			add_location(label0, file_1, 55, 8, 1872);
    			attr_dev(input0, "type", "file");
    			attr_dev(input0, "id", "file");
    			attr_dev(input0, "name", "file");
    			attr_dev(input0, "placeholder", "Select a file");
    			add_location(input0, file_1, 56, 8, 1926);
    			attr_dev(div0, "class", "mt-4");
    			add_location(div0, file_1, 54, 4, 1844);
    			attr_dev(label1, "for", "file");
    			attr_dev(label1, "class", "mr-4");
    			add_location(label1, file_1, 60, 8, 2061);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "name");
    			attr_dev(input1, "name", "name");
    			attr_dev(input1, "placeholder", "Enter a file name");
    			attr_dev(input1, "class", "bg-black");
    			add_location(input1, file_1, 61, 8, 2120);
    			attr_dev(div1, "class", "mt-4 ");
    			add_location(div1, file_1, 59, 4, 2032);
    			attr_dev(label2, "for", "file");
    			attr_dev(label2, "class", "mr-4");
    			add_location(label2, file_1, 65, 8, 2278);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "id", "fileHash");
    			attr_dev(input2, "name", "fileHash");
    			attr_dev(input2, "placeholder", "Enter a file hash");
    			attr_dev(input2, "class", "bg-black");
    			add_location(input2, file_1, 66, 8, 2337);
    			attr_dev(div2, "class", "mt-4");
    			add_location(div2, file_1, 64, 4, 2250);
    			attr_dev(label3, "for", "file");
    			attr_dev(label3, "class", "mr-4");
    			add_location(label3, file_1, 70, 8, 2507);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "id", "fileSize");
    			attr_dev(input3, "name", "fileSize");
    			attr_dev(input3, "placeholder", "Enter a file size");
    			attr_dev(input3, "class", "bg-black");
    			add_location(input3, file_1, 71, 8, 2566);
    			attr_dev(div3, "class", "mt-4");
    			add_location(div3, file_1, 69, 4, 2479);
    			attr_dev(button, "class", "bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-all");
    			add_location(button, file_1, 75, 8, 2736);
    			attr_dev(div4, "class", "mt-4");
    			add_location(div4, file_1, 74, 4, 2708);
    			attr_dev(div5, "class", "m-4 my-auto border-2 border-gray-600 rounded-md p-8");
    			add_location(div5, file_1, 50, 0, 1704);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, h10);
    			append_dev(div5, t1);
    			append_dev(div5, h11);
    			append_dev(div5, t3);
    			append_dev(div5, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t5);
    			append_dev(div0, input0);
    			/*input0_binding*/ ctx[8](input0);
    			append_dev(div5, t6);
    			append_dev(div5, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t8);
    			append_dev(div1, input1);
    			set_input_value(input1, /*name*/ ctx[0]);
    			append_dev(div5, t9);
    			append_dev(div5, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t11);
    			append_dev(div2, input2);
    			set_input_value(input2, /*fileHash*/ ctx[1]);
    			append_dev(div5, t12);
    			append_dev(div5, div3);
    			append_dev(div3, label3);
    			append_dev(div3, t14);
    			append_dev(div3, input3);
    			set_input_value(input3, /*fileSize*/ ctx[2]);
    			append_dev(div5, t15);
    			append_dev(div5, div4);
    			append_dev(div4, button);
    			insert_dev(target, t17, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t18, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[9]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[10]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[11]),
    					listen_dev(button, "click", /*uploadFile*/ ctx[7], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1 && input1.value !== /*name*/ ctx[0]) {
    				set_input_value(input1, /*name*/ ctx[0]);
    			}

    			if (dirty & /*fileHash*/ 2 && input2.value !== /*fileHash*/ ctx[1]) {
    				set_input_value(input2, /*fileHash*/ ctx[1]);
    			}

    			if (dirty & /*fileSize*/ 4 && input3.value !== /*fileSize*/ ctx[2]) {
    				set_input_value(input3, /*fileSize*/ ctx[2]);
    			}

    			if (/*error*/ ctx[5]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(t18.parentNode, t18);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*response*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			/*input0_binding*/ ctx[8](null);
    			if (detaching) detach_dev(t17);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t18);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Estuary', slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	let pathToFile = "";
    	let name = "";
    	let fileHash = "";
    	let fileSize = "";
    	let response = "";
    	let file;
    	let error = "";

    	const uploadFile = () => __awaiter(void 0, void 0, void 0, function* () {
    		if (!file.files || !file.files[0]) {
    			$$invalidate(5, error = "Please select a file");
    			return;
    		}

    		if (!name) {
    			$$invalidate(5, error = "Please enter a file name");
    			return;
    		}

    		const formData = { file: file.files[0].path, name };
    		console.log(formData);

    		const res = yield fetch('api/upload', {
    			method: 'POST',
    			body: JSON.stringify(formData)
    		});

    		const resAwait = yield res;

    		if (!resAwait.ok) {
    			$$invalidate(5, error = resAwait.statusText);
    			return;
    		}

    		console.log(res);
    		const responseJson = yield res.json();
    		console.log(responseJson);

    		if (responseJson.error) {
    			$$invalidate(5, error = responseJson.error);
    			return;
    		}

    		$$invalidate(3, response = responseJson.output);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Estuary> was created with unknown prop '${key}'`);
    	});

    	function input0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			file = $$value;
    			$$invalidate(4, file);
    		});
    	}

    	function input1_input_handler() {
    		name = this.value;
    		$$invalidate(0, name);
    	}

    	function input2_input_handler() {
    		fileHash = this.value;
    		$$invalidate(1, fileHash);
    	}

    	function input3_input_handler() {
    		fileSize = this.value;
    		$$invalidate(2, fileSize);
    	}

    	$$self.$capture_state = () => ({
    		__awaiter,
    		pathToFile,
    		name,
    		fileHash,
    		fileSize,
    		response,
    		file,
    		error,
    		uploadFile
    	});

    	$$self.$inject_state = $$props => {
    		if ('__awaiter' in $$props) __awaiter = $$props.__awaiter;
    		if ('pathToFile' in $$props) $$invalidate(6, pathToFile = $$props.pathToFile);
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('fileHash' in $$props) $$invalidate(1, fileHash = $$props.fileHash);
    		if ('fileSize' in $$props) $$invalidate(2, fileSize = $$props.fileSize);
    		if ('response' in $$props) $$invalidate(3, response = $$props.response);
    		if ('file' in $$props) $$invalidate(4, file = $$props.file);
    		if ('error' in $$props) $$invalidate(5, error = $$props.error);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		name,
    		fileHash,
    		fileSize,
    		response,
    		file,
    		error,
    		pathToFile,
    		uploadFile,
    		input0_binding,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler
    	];
    }

    class Estuary extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Estuary",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.57.0 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div;
    	let h1;
    	let t1;
    	let estuary;
    	let t2;
    	let ledger;
    	let current;
    	estuary = new Estuary({ $$inline: true });
    	ledger = new Ledger({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "LATIS Manufacturing Portal";
    			t1 = space();
    			create_component(estuary.$$.fragment);
    			t2 = space();
    			create_component(ledger.$$.fragment);
    			add_location(h1, file, 6, 4, 173);
    			attr_dev(div, "class", "m-4");
    			add_location(div, file, 5, 2, 150);
    			add_location(main, file, 4, 0, 140);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, h1);
    			append_dev(main, t1);
    			mount_component(estuary, main, null);
    			append_dev(main, t2);
    			mount_component(ledger, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(estuary.$$.fragment, local);
    			transition_in(ledger.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(estuary.$$.fragment, local);
    			transition_out(ledger.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(estuary);
    			destroy_component(ledger);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Estuary, Ledger });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body
    });

    return app;

})(Ledger);
//# sourceMappingURL=bundle.js.map
