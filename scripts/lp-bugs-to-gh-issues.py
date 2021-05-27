#!/usr/bin/python3
import os
import tempfile

from launchpadlib.launchpad import Launchpad
from github import Github

github = Github(os.getenv("GITHUB_TOKEN"))
github_repo = github.get_repo("canonical-web-and-design/maas-ui")

with tempfile.NamedTemporaryFile(mode="w") as f:
    f.write(os.getenv("LAUNCHPAD_CREDENTIALS"))
    f.flush()
    launchpad = Launchpad.login_with(
        service_root="production",
        credentials_file=f.name,
        application_name="prod-design-maas-ui-lp-bot",
    )

project = launchpad.projects["maas"]
ui_project = launchpad.projects["maas-ui"]


def generate_open_bugs():
    for task in project.searchTasks(status=["New", "Confirmed", "Triaged"], tags=["ui"]):
        has_ui_task = any(t.target == ui_project for t in task.related_tasks)
        if not has_ui_task:
            yield task.bug


def create_bug_task(issue, bug):
    ui_task = bug.addTask(target=ui_project)
    watch = bug.addWatch(
        bug_tracker=ui_project.bug_tracker, remote_bug=issue.number
    )
    ui_task.bug_watch = watch
    ui_task.lp_save()


print("Getting ui bugs")
count = 0
for bug in generate_open_bugs():
    username = bug.owner_link.replace("https://api.launchpad.net/1.0/~", "")
    issue_body = f"Bug originally filed by {username} at {bug.web_link}\n\n{bug.description}"
    issue = github_repo.create_issue(bug.title, issue_body)
    create_bug_task(issue, bug)
    count += 1
print(f"Issues created: {count}")
print("Closing fixed LP bugs")
closed_count = 0
for task in project.searchTasks(status=["New", "Confirmed", "Triaged"], tags=["ui"], status_upstream='resolved_upstream'):
    task.status = 'Fix Committed'
    task.lp_save()
    closed_count += 1

print(f"LP bugs closed: {closed_count}")
