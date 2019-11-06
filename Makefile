.DEFAULT_GOAL := all

elm = ./node_modules/.bin/elm
gh-pages = ./node_modules/.bin/gh-pages
uglifyjs = ./node_modules/.bin/uglifyjs

all: dist/ dist/elm.js dist/index.html

dist/:
	mkdir -p $@

dist/elm.js: $(shell find src -type f) package.json
	$(elm) make src/Main.elm --output $@

dist/index.html: src/index.html
	cp src/index.html dist/

deploy: all
	$(uglifyjs) dist/elm.js --compress 'pure_funcs="F2,F3,F4,F5,F6,F7,F8,F9,A2,A3,A4,A5,A6,A7,A8,A9",pure_getters,keep_fargs=false,unsafe_comps,unsafe' | $(uglifyjs) --mangle --output dist/elm.js
	$(gh-pages) --dist dist

clean:
	rm -Rf elm-stuff
	rm -Rf node_modules
	rm -Rf dist
