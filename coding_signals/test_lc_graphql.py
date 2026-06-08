import requests
import json

def get_lc_stats(username):
    url = "https://leetcode.com/graphql"
    query = """
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        profile {
            ranking
            reputation
        }
      }
      userContestRanking(username: $username) {
        rating
        globalRanking
      }
    }
    """
    
    response = requests.post(url, json={"query": query, "variables": {"username": username}})
    print(json.dumps(response.json(), indent=2))

get_lc_stats("himanshusolanki")
get_lc_stats("striver_79")
