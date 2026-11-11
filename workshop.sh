#!/usr/bin/env bash
#
# Usage: ./workshop.sh up | reset
#
# Deployment is ordered here instead of a single "gradlew deploy":
#
# - The site initializer fails if it runs during Liferay startup, and its pages
#   reference the frontend client extensions.
# - OAuth applications resolve scopes such as c_task.everything only when they
#   are created, so the microservice and the batch come after the Task object.
#

set -euo pipefail

cd "$(dirname "$0")"

CREDENTIALS="test@liferay.com:test"
LIFERAY_URL="http://localhost:8080"

function api {
	curl --fail --silent --user "${CREDENTIALS}" "${LIFERAY_URL}${1}"
}

function deploy {
	for name in "${@}"
	do
		./gradlew --quiet ":client-extensions:${name}:deploy"
	done
}

function has_sample_tasks {
	api "/o/c/tasks?pageSize=1" | grep --quiet '"totalCount" : [1-9]'
}

function microservice_started {
	docker compose logs object-action | grep --quiet "Started ToDoListSpringBootApplication"
}

function wait_until {
	local description="${1}"

	shift

	echo "Aguardando ${description}..."

	for _ in $(seq 1 120)
	do
		if "${@}" > /dev/null 2>&1
		then
			return
		fi

		sleep 5
	done

	echo "Tempo esgotado aguardando ${description}." >&2

	exit 1
}

function up {
	./gradlew --quiet build

	mkdir -p bundles/osgi/client-extensions

	docker compose up --detach

	wait_until "o Liferay" api /o/headless-admin-user/v1.0/my-user-account

	deploy todo-commons todo-app todo-global todo-theme todo-site-initializer

	wait_until "o site initializer" api /o/c/tasks

	deploy todo-object-action

	wait_until "o microsserviço" microservice_started

	deploy todo-batch

	wait_until "as tarefas de exemplo" has_sample_tasks

	cat <<-MESSAGE

	Pronto: ${LIFERAY_URL}/web/to-do-workshop (test@liferay.com / test)

	Passos manuais (a GA132 não permite automatizar):
	  1. Site > Páginas > Configuração > Design: Theme CSS "To-Do Theme CSS",
	     favicon "To-Do Favicon", Global CSS e Global JS do To-Do.
	  2. Process Builder > Configuração: Categoria > Category Approval.
	MESSAGE
}

function reset {
	docker compose down --volumes

	rm -rf bundles/osgi/client-extensions
}

case "${1:-}" in
	reset) reset ;;
	up) up ;;
	*) echo "Uso: ${0} up | reset" >&2; exit 1 ;;
esac
