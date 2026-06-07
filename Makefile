PORT ?= 8080

.PHONY: help serve open kill

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-8s\033[0m %s\n", $$1, $$2}'

serve: ## Start the dev server (uv) on PORT (default 8080)
	uv run -m http.server $(PORT)

open: ## Open the app in the default browser
	open http://localhost:$(PORT)

kill: ## Kill any process on PORT
	@lsof -ti:$(PORT) | xargs kill 2>/dev/null; echo "Port $(PORT) freed"
