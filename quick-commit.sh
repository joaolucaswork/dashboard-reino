#!/bin/bash

# Quick Commit Script - Automates git add, commit, and push workflow
# Usage: ./quick-commit.sh [optional-commit-message]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to generate a meaningful commit message
generate_commit_message() {
    local current_date=$(date +"%Y-%m-%d")
    local current_time=$(date +"%H:%M")
    
    # Array of generic but meaningful commit messages
    local messages=(
        "Update project files and configurations"
        "Apply latest changes and improvements"
        "Sync recent modifications and updates"
        "Update codebase with recent changes"
        "Apply development updates and fixes"
        "Update project components and features"
        "Sync latest development changes"
        "Apply recent code improvements"
        "Update project files and dependencies"
        "Implement latest changes and updates"
    )
    
    # Select a random message from the array
    local random_index=$((RANDOM % ${#messages[@]}))
    local base_message="${messages[$random_index]}"
    
    # Add timestamp for uniqueness
    echo "${base_message} (${current_date} ${current_time})"
}

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository. Please run this script from within a git repository."
        exit 1
    fi
}

# Function to get current branch name
get_current_branch() {
    git branch --show-current
}

# Function to check if there are any changes to commit
check_for_changes() {
    # Check for staged changes
    if git diff --cached --quiet; then
        # No staged changes, check for unstaged changes
        if git diff --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
            return 1  # No changes at all
        fi
    fi
    return 0  # There are changes
}

# Function to show what will be committed
show_changes() {
    print_status "Changes to be committed:"
    echo
    
    # Show staged changes
    if ! git diff --cached --quiet; then
        echo -e "${GREEN}Staged changes:${NC}"
        git diff --cached --name-status | sed 's/^/  /'
        echo
    fi
    
    # Show unstaged changes
    if ! git diff --quiet; then
        echo -e "${YELLOW}Unstaged changes (will be staged):${NC}"
        git diff --name-status | sed 's/^/  /'
        echo
    fi
    
    # Show untracked files
    local untracked=$(git ls-files --others --exclude-standard)
    if [ -n "$untracked" ]; then
        echo -e "${BLUE}Untracked files (will be added):${NC}"
        echo "$untracked" | sed 's/^/  /'
        echo
    fi
}

# Main execution
main() {
    print_status "Starting automated git workflow..."
    echo
    
    # Check if we're in a git repository
    check_git_repo
    
    # Get current branch
    local current_branch=$(get_current_branch)
    print_status "Working on branch: ${current_branch}"
    
    # Check for changes
    if ! check_for_changes; then
        print_warning "No changes detected. Nothing to commit."
        exit 0
    fi
    
    # Show what will be committed
    show_changes
    
    # Step 1: Stage all changes
    print_status "Staging all changes..."
    if git add .; then
        print_success "All changes staged successfully"
    else
        print_error "Failed to stage changes"
        exit 1
    fi
    
    # Step 2: Commit with message
    local commit_message
    if [ -n "$1" ]; then
        commit_message="$1"
        print_status "Using provided commit message: '$commit_message'"
    else
        commit_message=$(generate_commit_message)
        print_status "Using auto-generated commit message: '$commit_message'"
    fi
    
    print_status "Committing changes..."
    if git commit -m "$commit_message"; then
        print_success "Changes committed successfully"
    else
        print_error "Failed to commit changes"
        exit 1
    fi
    
    # Step 3: Push to current branch
    print_status "Pushing to remote branch '${current_branch}'..."
    if git push origin "$current_branch"; then
        print_success "Changes pushed successfully to '${current_branch}'"
    else
        print_error "Failed to push changes. This might be due to:"
        echo "  - Network connectivity issues"
        echo "  - Remote branch doesn't exist (try: git push -u origin ${current_branch})"
        echo "  - Authentication issues"
        echo "  - Conflicts with remote changes (try: git pull first)"
        exit 1
    fi
    
    echo
    print_success "Git workflow completed successfully!"
    print_status "Summary:"
    echo "  - Branch: ${current_branch}"
    echo "  - Commit: $commit_message"
    echo "  - Status: All changes pushed to remote"
}

# Handle script interruption
trap 'print_error "Script interrupted by user"; exit 130' INT

# Run main function with all arguments
main "$@"
