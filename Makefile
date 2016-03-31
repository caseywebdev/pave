BIN=node_modules/.bin/
COGS=$(BIN)cogs
WATCHY=$(BIN)watchy
TEST=$(BIN)istanbul cover $(BIN)_mocha build/test.js

all: install clean test

dev: clean install
	@make -j build-w test-w

clean:
	@rm -fr build

install:
	@npm install

build:
	@$(COGS)

build-w:
	@$(COGS) -w src

test: build
	@$(TEST)

test-w:
	@$(WATCHY) -w build -- $(TEST)
