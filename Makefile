.DEFAULT_GOAL := all
elm = node_modules/.bin/elm

all: elm.js

elm.js: $(shell find src -type f) package.json
	$(elm) make src/Main.elm --output=elm.js

clean:
	rm -Rf elm-stuff
	rm -Rf node_modules
