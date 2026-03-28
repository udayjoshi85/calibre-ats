import re
import httpx
from typing import Optional

from app.config import get_settings


async def enrich_github_profile(github_url: str) -> dict:
    """Fetch public GitHub profile data."""
    settings = get_settings()

    # Extract username from URL
    username_match = re.search(r"github\.com/([\w\-]+)", github_url)
    if not username_match:
        return {"error": "Invalid GitHub URL"}

    username = username_match.group(1)

    headers = {"Accept": "application/vnd.github.v3+json"}
    if settings.github_token:
        headers["Authorization"] = f"token {settings.github_token}"

    async with httpx.AsyncClient() as client:
        try:
            # Fetch user profile
            user_response = await client.get(
                f"https://api.github.com/users/{username}",
                headers=headers,
                timeout=10.0
            )

            if user_response.status_code != 200:
                return {"error": f"GitHub API error: {user_response.status_code}"}

            user_data = user_response.json()

            # Fetch repositories
            repos_response = await client.get(
                f"https://api.github.com/users/{username}/repos",
                headers=headers,
                params={"per_page": 100, "sort": "updated"},
                timeout=10.0
            )

            repos_data = repos_response.json() if repos_response.status_code == 200 else []

            # Calculate language stats
            languages = {}
            for repo in repos_data:
                if repo.get("language"):
                    lang = repo["language"]
                    languages[lang] = languages.get(lang, 0) + 1

            # Sort languages by count
            sorted_languages = dict(sorted(languages.items(), key=lambda x: x[1], reverse=True))

            # Get top repos
            top_repos = []
            for repo in sorted(repos_data, key=lambda x: x.get("stargazers_count", 0), reverse=True)[:5]:
                top_repos.append({
                    "name": repo["name"],
                    "description": repo.get("description", ""),
                    "stars": repo.get("stargazers_count", 0),
                    "forks": repo.get("forks_count", 0),
                    "language": repo.get("language"),
                    "url": repo.get("html_url"),
                })

            # Calculate activity score (0-100)
            public_repos = user_data.get("public_repos", 0)
            followers = user_data.get("followers", 0)
            total_stars = sum(repo.get("stargazers_count", 0) for repo in repos_data)

            activity_score = min(100, (
                (min(public_repos, 50) * 1.0) +  # Up to 50 points for repos
                (min(followers, 100) * 0.3) +    # Up to 30 points for followers
                (min(total_stars, 100) * 0.2)    # Up to 20 points for stars
            ))

            return {
                "username": username,
                "name": user_data.get("name"),
                "bio": user_data.get("bio"),
                "public_repos": public_repos,
                "followers": followers,
                "following": user_data.get("following", 0),
                "created_at": user_data.get("created_at"),
                "languages": sorted_languages,
                "top_repos": top_repos,
                "total_stars": total_stars,
                "activity_score": int(activity_score),
                "profile_url": user_data.get("html_url"),
            }

        except httpx.TimeoutException:
            return {"error": "GitHub API timeout"}
        except Exception as e:
            return {"error": str(e)}


def calculate_github_score(github_data: dict) -> int:
    """Calculate a proof-of-work score from GitHub data."""
    if not github_data or github_data.get("error"):
        return 0

    score = 0

    # Repos (up to 30 points)
    repos = github_data.get("public_repos", 0)
    score += min(30, repos * 1.5)

    # Stars (up to 25 points)
    stars = github_data.get("total_stars", 0)
    score += min(25, stars * 2.5)

    # Languages diversity (up to 20 points)
    languages = github_data.get("languages", {})
    score += min(20, len(languages) * 4)

    # Followers (up to 15 points)
    followers = github_data.get("followers", 0)
    score += min(15, followers * 0.5)

    # Activity score from API (up to 10 points)
    activity = github_data.get("activity_score", 0)
    score += activity * 0.1

    return min(100, int(score))
