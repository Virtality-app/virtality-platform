#!/usr/bin/env bash
# Points pr-<n>-console.virtality.app and pr-<n>-admin.virtality.app at a PR's
# Vercel previews. Sign-in only works on *.virtality.app: the session cookie and
# Better Auth's trusted origins never cover the *.vercel.app preview hosts.
#
# Usage:
#   alias-pr-preview.sh assign   wait for the previews, alias them, comment on the PR
#   alias-pr-preview.sh remove   delete the aliases once the PR closes
#
# Env: VERCEL_TOKEN, VERCEL_TEAM_ID and PR_NUMBER; assign also needs HEAD_SHA,
# GH_TOKEN and GITHUB_REPOSITORY.
set -euo pipefail

# <Vercel project>:<app name in the alias>. Keep the app names in step with
# PR_PREVIEW_ORIGIN_PATTERN in packages/shared/src/types/general.ts.
PROJECTS=(vir-console:console vir-admin:admin)
DOMAIN=virtality.app
COMMENT_MARKER='<!-- pr-preview-aliases -->'
# Vercel creates a deployment within seconds of the push. None after this long
# means Vercel skipped the project for the commit.
APPEAR_TIMEOUT=${APPEAR_TIMEOUT:-180}
READY_TIMEOUT=${READY_TIMEOUT:-1200}
POLL_INTERVAL=${POLL_INTERVAL:-15}

: "${VERCEL_TOKEN:?}" "${VERCEL_TEAM_ID:?}" "${PR_NUMBER:?}"

vercel_api() {
  local method=$1 path=$2 response separator='?'
  shift 2
  [[ $path == *\?* ]] && separator='&'
  if ! response=$(curl --silent --show-error --fail-with-body \
    --request "$method" \
    --header "Authorization: Bearer $VERCEL_TOKEN" \
    --header 'Content-Type: application/json' \
    "https://api.vercel.com$path${separator}teamId=$VERCEL_TEAM_ID" "$@"); then
    echo "Vercel API $method $path failed: $response" >&2
    return 1
  fi
  echo "$response"
}

alias_host() {
  echo "pr-$PR_NUMBER-$1.$DOMAIN"
}

# Prints "<deployment id> <state>" for the project's deployment of HEAD_SHA, or
# nothing when Vercel hasn't created one.
find_deployment() {
  vercel_api GET "/v6/deployments?projectId=$1&sha=$HEAD_SHA&limit=1" |
    jq -r '.deployments[0] // empty | "\(.uid) \(.state // .readyState)"'
}

# Waits for the project's deployment of HEAD_SHA. Returns 0 and prints the
# deployment id once it's ready, 1 and the reason when it won't be, or 2 when
# the Vercel API fails.
wait_for_deployment() {
  local project=$1 started=$SECONDS found id state waited
  while true; do
    found=$(find_deployment "$project") || return 2
    read -r id state <<<"$found" || true
    waited=$((SECONDS - started))
    if [[ -z $id ]]; then
      if ((waited >= APPEAR_TIMEOUT)); then
        echo 'no new deployment for this commit'
        return 1
      fi
    else
      case $state in
        READY)
          echo "$id"
          return 0
          ;;
        ERROR | CANCELED)
          echo "deployment ${state,,}"
          return 1
          ;;
      esac
      if ((waited >= READY_TIMEOUT)); then
        echo "still ${state,,} after $((READY_TIMEOUT / 60)) minutes"
        return 1
      fi
    fi
    sleep "$POLL_INTERVAL"
  done
}

# Creates the PR comment, or updates the one an earlier run left.
upsert_comment() {
  local body=$1 id
  id=$(gh api --paginate "repos/$GITHUB_REPOSITORY/issues/$PR_NUMBER/comments" \
    --jq ".[] | select(.body | startswith(\"$COMMENT_MARKER\")) | .id" |
    sed -n 1p)
  if [[ -n $id ]]; then
    gh api --method PATCH "repos/$GITHUB_REPOSITORY/issues/comments/$id" \
      -f body="$body" >/dev/null
  else
    gh api --method POST "repos/$GITHUB_REPOSITORY/issues/$PR_NUMBER/comments" \
      -f body="$body" >/dev/null
  fi
}

assign() {
  : "${HEAD_SHA:?}" "${GH_TOKEN:?}" "${GITHUB_REPOSITORY:?}"
  local entry project app host result status rows=''
  for entry in "${PROJECTS[@]}"; do
    project=${entry%%:*}
    app=${entry#*:}
    host=$(alias_host "$app")
    status=0
    result=$(wait_for_deployment "$project") || status=$?
    case $status in
      0)
        vercel_api POST "/v2/deployments/$result/aliases" \
          --data "{\"alias\":\"$host\"}" >/dev/null
        echo "Aliased $host to $project deployment $result"
        rows+="| $app | https://$host |"$'\n'
        ;;
      1)
        echo "Skipped $project: $result"
        rows+="| $app | Not updated: $result |"$'\n'
        ;;
      *)
        echo "::error::Could not read $project deployments from Vercel. Check the VERCEL_TOKEN secret."
        exit 1
        ;;
    esac
  done

  upsert_comment "$COMMENT_MARKER
### Previews you can sign in to

| App | URL |
| --- | --- |
${rows}
Updated for ${HEAD_SHA:0:7}. The \`*.vercel.app\` preview links can't keep a session, so use these. They run against the staging server and database."
}

remove() {
  local entry host
  for entry in "${PROJECTS[@]}"; do
    host=$(alias_host "${entry#*:}")
    if vercel_api DELETE "/v2/aliases/$host" >/dev/null; then
      echo "Removed $host"
    else
      echo "::warning::Could not remove $host. It may never have been created."
    fi
  done
}

case ${1:-} in
  assign) assign ;;
  remove) remove ;;
  *)
    echo "Usage: $0 assign|remove" >&2
    exit 64
    ;;
esac
