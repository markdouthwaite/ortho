.PHONY: test serve

test:
	@export NODE_ENV=local
	@docker-compose build
	@docker-compose run -d ortho-backend
	@docker-compose run ortho-service npm test
	@docker-compose down

serve:
	@export NODE_ENV=local
	@docker-compose build
	@docker-compose up

deploy:
