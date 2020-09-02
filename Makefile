test:
	@docker-compose run ortho-backend &
	@npm test

serve:
	@export MONGODB_URI=mongodb://localhost:27017
	@docker-compose build
	@docker-compose up &