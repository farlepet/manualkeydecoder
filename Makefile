DIST = ./dist
SRC  = ./src



scss-compile: $(DIST)/css/
	sassc $(SRC)/scss/main.scss $(DIST)/css/main.css

copy-web: $(DIST)
	cp -r lib dist/
	cp src/index.html src/dsd.json dist

clean:
	rm -r dist


$(DIST)/css/: $(DIST)
	-mkdir $(DIST)/css

$(DIST):
	mkdir $(DIST)