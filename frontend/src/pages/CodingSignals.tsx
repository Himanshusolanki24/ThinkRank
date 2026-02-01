/**
 * Coding Signals Page
 * 
 * Allows users to connect their coding platform accounts and view
 * their unified skill profile across LeetCode, Codeforces, CodeChef, etc.
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
    Code2,
    Trophy,
    Target,
    TrendingUp,
    Loader2,
    RefreshCw,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Sparkles,
    Brain,
    Zap,
    BarChart3,
    Award
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Platform logo components
const LeetCodeLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
    </svg>
);

const CodeforcesLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.672 21 0 20.328 0 19.5V9c0-.828.672-1.5 1.5-1.5h3zm9-4.5c.828 0 1.5.672 1.5 1.5v15c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5v-15c0-.828.672-1.5 1.5-1.5h3zm9 7.5c.828 0 1.5.672 1.5 1.5v7.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V12c0-.828.672-1.5 1.5-1.5h3z" />
    </svg>
);

const CodeChefLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48" fill="currentColor">
        <path fill="#5d4037" d="M34.809,32.711L34.809,32.711c1.016,0.306,1.952,0.833,2.74,1.543 c0.133,0.085,0.219,0.228,0.23,0.386c0,0.235-0.175,0.466-0.536,0.686c-0.648,0.434-1.273,0.9-1.873,1.398 c-0.592,0.483-1.212,0.93-1.858,1.337c-0.083,0.044-0.176,0.068-0.27,0.07c-0.132,0.002-0.26-0.048-0.356-0.14 c-0.184-0.16-0.203-0.438-0.043-0.622c0.004-0.005,0.009-0.01,0.013-0.014c0.202-0.26,0.465-0.467,0.766-0.601 c0.354-0.194,0.689-0.421,1.002-0.676c0.501-0.381,0.801-0.636,1.002-0.751c0.396-0.2,0.601-0.341,0.601-0.426 c0.004-0.018,0.004-0.037,0-0.055c-0.247-0.407-0.63-0.712-1.082-0.862c-0.446-0.125-0.902-0.26-1.357-0.401 c-0.456-0.114-0.869-0.355-1.192-0.696c-0.01-0.031-0.01-0.064,0-0.095c0.016-0.142,0.086-0.273,0.195-0.366 c0.09-0.112,0.222-0.182,0.366-0.195c0.073-0.01,0.147-0.01,0.22,0c0.268,0.015,0.532,0.079,0.776,0.19l0.726,0.316 M13.465,32.28 c0.181-0.003,0.358,0.055,0.501,0.165c0.12,0.092,0.192,0.234,0.195,0.386c0.001,0.108-0.043,0.211-0.12,0.286 c-0.54,0.476-1.173,0.836-1.858,1.057c-0.69,0.22-1.3,0.638-1.753,1.202c0.646,0.375,1.316,0.71,2.004,1.002l2.074,0.912 c0.161,0.064,0.263,0.223,0.255,0.396c0.03,0.235-0.072,0.468-0.265,0.606c-0.19,0.157-0.43,0.242-0.676,0.24 c-0.1,0-0.199-0.02-0.291-0.06c-0.141-0.138-0.292-0.265-0.451-0.381c-1.202-0.668-2.488-1.292-3.857-1.873 c-0.135-0.055-0.275-0.11-0.411-0.155c-0.151-0.061-0.263-0.192-0.301-0.351c0.006-0.42,0.188-0.817,0.501-1.097 c0.644-0.469,1.342-0.859,2.079-1.162c0.743-0.297,1.444-0.692,2.084-1.172H13.465z"></path><path fill="#5d4037" d="M22.051,32.24c-0.171-0.265-0.384-0.5-0.631-0.696c-0.198-0.138-0.435-0.21-0.676-0.205 c-0.081-0.002-0.161,0.013-0.235,0.045l-1.503,0.501c-0.096,0.03-0.195,0.043-0.296,0.04c-0.178,0.013-0.355-0.037-0.501-0.14 c-0.182-0.158-0.336-0.346-0.456-0.556l-0.416,0.281c0.176,0.295,0.403,0.556,0.671,0.771c0.211,0.132,0.457,0.197,0.706,0.185 c0.127-0.001,0.254-0.02,0.376-0.055l1.388-0.501c0.094-0.036,0.194-0.055,0.296-0.055c0.152-0.01,0.304,0.031,0.431,0.115 c0.175,0.143,0.327,0.312,0.451,0.501l0.396-0.22"></path><path fill="#5d4037" fillRule="evenodd" d="M32.289,40.61c0.761,4.558-4.809,5.009-7.098,2.95 c-1.583-1.413-1.137-3.381,1.132-3.256C28.327,40.41,29.494,42.984,32.289,40.61" clipRule="evenodd"></path><path fill="#5d4037" fillRule="evenodd" d="M15.364,40.61c-0.761,4.558,4.809,5.009,7.098,2.95 c1.583-1.413,1.137-3.381-1.132-3.256C19.326,40.41,18.159,42.984,15.364,40.61" clipRule="evenodd"></path><path fill="#5d4037" d="M20.839,33.998c-0.279-0.184-0.608-0.276-0.942-0.265c-0.404-0.015-0.798,0.129-1.097,0.401 c-0.338,0.332-0.482,0.814-0.381,1.277c0.049,0.436,0.223,0.848,0.501,1.187c0.236,0.316,0.607,0.502,1.002,0.501 c0.258-0.004,0.511-0.073,0.736-0.2c0.451-0.27,0.671-0.781,0.671-1.548C21.387,34.848,21.206,34.347,20.839,33.998z M19.877,35.811c-0.277,0-0.501-0.224-0.501-0.501s0.224-0.501,0.501-0.501s0.501,0.224,0.501,0.501S20.154,35.811,19.877,35.811z"></path><path fill="#5d4037" d="M24.195,39.914c0.139,0.001,0.276-0.025,0.406-0.075c0.124-0.048,0.242-0.112,0.351-0.19 c0.102-0.082,0.198-0.173,0.286-0.27c0.083-0.093,0.156-0.194,0.22-0.301c0.061-0.094,0.115-0.193,0.16-0.296 c0.035-0.074,0.064-0.151,0.085-0.23v-0.045c-0.01-0.014-0.019-0.029-0.025-0.045l0,0c-0.13,0.2-0.293,0.378-0.481,0.526 c-0.144,0.136-0.314,0.24-0.501,0.306c-0.188,0.065-0.387,0.097-0.586,0.095c-0.17,0.003-0.339-0.021-0.501-0.07 c-0.139-0.044-0.269-0.112-0.386-0.2c-0.117-0.094-0.223-0.202-0.316-0.321c-0.097-0.13-0.18-0.269-0.25-0.416l0,0 c-0.011,0.011-0.02,0.025-0.025,0.04c0,0,0,0.03,0,0.04c0.068,0.192,0.156,0.376,0.26,0.551c0.094,0.168,0.212,0.322,0.351,0.456 c0.124,0.13,0.27,0.236,0.431,0.316c0.159,0.067,0.329,0.104,0.501,0.11"></path><path fill="#5d4037" d="M28.613,33.968c-0.278-0.185-0.607-0.28-0.942-0.27c-0.405-0.014-0.799,0.132-1.097,0.406 c-0.336,0.333-0.478,0.815-0.376,1.277c0.046,0.436,0.22,0.85,0.501,1.187c0.236,0.315,0.608,0.501,1.002,0.501 c0.258-0.004,0.512-0.073,0.736-0.2c0.493-0.352,0.752-0.947,0.676-1.548C29.089,34.644,28.928,34.188,28.613,33.968z M27.511,35.867c-0.277,0-0.501-0.224-0.501-0.501s0.224-0.501,0.501-0.501s0.501,0.224,0.501,0.501S27.787,35.867,27.511,35.867z"></path><path fill="#cfd8dc" d="M38.519,9.951c-0.113-0.175-0.224-0.354-0.339-0.518c-0.092-0.132-0.186-0.252-0.279-0.377	c-0.137-0.184-0.275-0.367-0.414-0.537c-0.083-0.102-0.167-0.196-0.251-0.293c-0.155-0.178-0.309-0.351-0.465-0.513	C36.7,7.64,36.63,7.57,36.559,7.5c-0.181-0.18-0.363-0.35-0.546-0.51c-0.043-0.037-0.085-0.075-0.128-0.111	c-2.281-1.946-4.592-2.44-6.076-2.765l-0.821-0.185c-3.005-0.576-5.53-0.867-8.09-0.501c-1.008,0.219-1.982,0.573-2.895,1.052	c-1.257,0.571-2.565,1.162-3.827,1.252c-1.321,0.341-2.468,1.162-3.216,2.304l-0.14,0.2c-0.671,1.403-0.847,2.992-0.501,4.508	c0.276,0.902,0.616,1.783,0.937,2.63c0.736,1.727,1.269,3.534,1.588,5.385c0.332,0.658,0.591,1.35,0.771,2.064	c0.426,1.483,0.912,3.151,2.229,4.448h0.035c0.011-0.005,0.022-0.009,0.033-0.014c0.003,0.003,0.005,0.006,0.008,0.009	c1.14-0.54,2.24-0.902,3.307-1.124c0.15-0.031,0.298-0.053,0.446-0.078c0.18-0.031,0.36-0.063,0.538-0.087	c0.289-0.037,0.576-0.064,0.861-0.081c0.025-0.002,0.05-0.005,0.075-0.006c3.649-0.2,6.912,1.133,10.1,2.433l0.575,0.238	c0.018-0.008,0.035-0.029,0.053-0.039c0.01,0.004,0.019,0.008,0.029,0.012c0.781-0.341,1.177-2.965,1.703-5.41	c1.893-4.333,6.126-7.514,5.871-11.521C39.169,10.996,38.846,10.459,38.519,9.951z"></path><polygon fill="#cfd8dc" points="31.829,28.563 31.822,28.561 31.819,28.563"></polygon><path fill="#ef5350" d="M31.473,26.384c-0.007-0.089-0.044-0.18-0.071-0.27c0-0.001-0.001-0.003-0.001-0.004	c-0.337-1.099-2.136-2.252-4.586-2.876c-0.135-0.036-0.273-0.053-0.409-0.084c-0.006-0.001-0.012-0.002-0.018-0.004	c-0.585-0.134-1.176-0.224-1.771-0.277c-0.036-0.003-0.072-0.007-0.108-0.01c-0.338-0.027-0.675-0.044-1.014-0.044	c-0.298-0.002-0.597,0.003-0.895,0.023c-0.133,0.009-0.265,0.022-0.397,0.035c-0.311,0.031-0.62,0.073-0.926,0.13	c-0.107,0.018-0.215,0.024-0.322,0.045c-2.018,0.371-3.797,1.551-4.924,3.266l0.065,2.65v0.04h0.03	c1.741-0.997,3.667-1.628,5.66-1.853c3.171-0.286,6.417,0.681,9.587,2.895h0.03v-0.05C31.616,28.803,31.64,27.584,31.473,26.384z"></path><path fill="#eceff1" fillRule="evenodd" d="M12.975,7.881c-0.341,1.733,1.202,7.203,0.701,10.073	c-0.26-1.503-1.222-4.508-1.182-6.176c-0.461-1.002-0.927-2.229-1.438-2.7S12.113,6.158,13,7.881" clipRule="evenodd"></path><path fill="#b0bec5" d="M16.476,25.493L16.476,25.493c-2.004-2.364-2.855-6.437-3.556-9.868	c-0.556-2.725-1.032-5.049-1.949-5.78l0,0c-0.109-0.148-0.182-0.319-0.21-0.501c-0.032-0.347,0.039-0.696,0.205-1.002	C11.124,8,11.367,7.705,11.672,7.485c0.193-0.133,0.414-0.218,0.646-0.25V7.28c-0.231,0.032-0.45,0.117-0.641,0.25	c-0.202,0.253-0.383,0.523-0.541,0.806c-0.451,0.902,0.501,0.857,0.857,1.347c0.927,0.746,1.002,3.196,1.563,5.931	c0.701,3.426,0.932,7.489,2.94,9.843l0,0l0,0l-0.03,0.035"></path><path fill="#eceff1" fillRule="evenodd" d="M16.401,7.175c-0.346,1.728,0.536,5.705,0,8.58	c-0.26-1.503-1.222-4.508-1.182-6.171c-0.466-1.002-1.002-2.164-1.347-2.76s1.237-1.257,2.505,0.351" clipRule="evenodd"></path><path fill="#b0bec5" d="M15.73,6.564c-0.278-0.233-0.65-0.318-1.002-0.23c-0.138,0.015-0.27,0.063-0.386,0.14	c-0.102,0.067-0.171,0.175-0.19,0.296c0,0.18-0.14,0.21,0,0.546l0,0c1.122,1.503,2.004,4.042,2.214,6.722	c0.301,3.401-0.095,7.168,2.159,9.838l-0.035,0.03c-2.264-2.685-2.6-6.457-2.895-9.863c-0.24-2.675-0.456-5.129-1.568-6.637l0,0	c-0.189-0.211-0.285-0.489-0.265-0.771c0.022-0.132,0.096-0.249,0.205-0.326c0.123-0.086,0.266-0.138,0.416-0.15	c0.479-0.038,0.956,0.093,1.347,0.371l-0.03,0.035"></path><path fill="#eceff1" d="M21.911,4.129c1.042,1.738-0.872,9.562-1.222,14.476c-0.03,0.416-3.697-16.224,1.212-14.476"></path><path fill="#b0bec5" d="M21.475,22.943c-1.475-4.089-2.37-8.365-2.66-12.703c-0.113-1.435,0.002-2.879,0.341-4.278	c0.326-1.112,0.897-1.843,1.783-1.974c0.324-0.042,0.652-0.018,0.967,0.07v0.045c-0.319-0.059-0.647-0.049-0.962,0.03	c-0.741,0.17-0.651,0.631-1.137,1.678c-0.379,1.346-0.502,2.751-0.361,4.142c0.631,4.127,1.408,9.758,2.079,12.958H21.49"></path><path fill="#b0bec5" d="M24.931,22.678c-0.05-0.336-0.095-0.676-0.145-1.002c-0.771-5.59-1.718-12.402,1.598-17.296	h0.04c-1.357,3.622-1.543,10.519-1.703,12.743c-0.07,0.962,0.04,3.005,0.115,4.508c0.045,0.346,0.1,0.686,0.145,1.027h-0.05"></path><path fill="#b0bec5" d="M28.528,23.394c0.115-2.885,0.421-6.261,0.701-9.187c0.696-3.687,2.57-5.43,3.061-9.157	V5.006c-1.69,2.827-2.813,5.956-3.306,9.212c-0.457,3.036-0.597,6.112-0.416,9.177h-0.05"></path><g><path fill="#b0bec5" d="M37.218,9.429c-1.503,4.628-3.276,9.152-5.079,13.73C32.189,17.098,35.435,9.804,37.218,9.429"></path><path fill="#b0bec5" d="M31.258,25.197c0.791-0.821,0.847-2.084,0.917-3.551c-0.017-1.501,0.251-2.992,0.791-4.393 c0-0.06,0.045-0.155,0.08-0.286c0.441-1.528,2.199-7.684,4.248-7.574v0.045c-1.608-0.06-3.657,6.011-4.142,7.549 c-0.035,0.125-0.045,0.205-0.065,0.27l0,0c-0.576,1.503-0.611,3.005-0.801,4.378c-0.065,1.473-0.19,2.745-1.002,3.576h-0.03"></path></g>
    </svg>
);

const HackerRankLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c1.285 0 9.75 4.886 10.392 6 .645 1.115.645 10.885 0 12S13.287 24 12 24s-9.75-4.885-10.395-6c-.641-1.114-.641-10.885 0-12C2.25 4.886 10.715 0 12 0zm2.295 6.799c-.141 0-.258.115-.258.257v3.675h-4.074V7.056c0-.142-.116-.257-.257-.257h-1.64c-.142 0-.257.116-.257.258v9.943c0 .14.115.257.257.257h1.64c.141 0 .257-.116.257-.258v-4.166h4.074v4.166c0 .141.116.257.258.257h1.639c.142 0 .258-.116.258-.257v-9.943c0-.142-.116-.258-.258-.258h-1.639z" />
    </svg>
);

const GitHubLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
);

// Platform configuration with SVG logos
const PLATFORMS = [
    {
        id: "leetcode",
        name: "LeetCode",
        Logo: LeetCodeLogo,
        logoColor: "text-orange-500",
        color: "from-orange-500 to-yellow-500",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/30",
        url: "https://leetcode.com/u",
        description: "Interview preparation & problem solving"
    },
    {
        id: "codeforces",
        name: "Codeforces",
        Logo: CodeforcesLogo,
        logoColor: "text-blue-500",
        color: "from-blue-500 to-cyan-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
        url: "https://codeforces.com/profile",
        description: "Competitive programming contests"
    },
    {
        id: "codechef",
        name: "CodeChef",
        Logo: CodeChefLogo,
        logoColor: "text-amber-600",
        color: "from-amber-600 to-orange-600",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
        url: "https://www.codechef.com/users",
        description: "Indian competitive programming"
    },
    {
        id: "hackerrank",
        name: "HackerRank",
        Logo: HackerRankLogo,
        logoColor: "text-green-500",
        color: "from-green-500 to-emerald-500",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30",
        url: "https://www.hackerrank.com/profile",
        description: "Skills & certifications"
    },
    {
        id: "github",
        name: "GitHub",
        Logo: GitHubLogo,
        logoColor: "text-gray-300",
        color: "from-gray-600 to-gray-800",
        bgColor: "bg-gray-500/10",
        borderColor: "border-gray-500/30",
        url: "https://github.com",
        description: "Code repositories & contributions"
    }
];

// Grade colors
const GRADE_COLORS: Record<string, string> = {
    "A+": "from-emerald-400 to-green-500",
    "A": "from-green-400 to-emerald-500",
    "A-": "from-lime-400 to-green-500",
    "B+": "from-blue-400 to-cyan-500",
    "B": "from-cyan-400 to-blue-500",
    "B-": "from-sky-400 to-blue-500",
    "C+": "from-yellow-400 to-amber-500",
    "C": "from-amber-400 to-yellow-500",
    "C-": "from-orange-400 to-amber-500",
    "D": "from-orange-400 to-red-500",
    "F": "from-red-400 to-rose-500"
};

interface PlatformUsernames {
    leetcode?: string;
    codeforces?: string;
    codechef?: string;
    hackerrank?: string;
    github?: string;
}

interface NormalizedProfile {
    problemSolving: number;
    algorithmicDepth: number;
    consistency: number;
    competitiveStrength: number;
    platformCoverage: Record<string, boolean>;
    overallGrade: string;
    overallScore: number;
    recommendations: string[];
}

interface PlatformData {
    leetcode?: any;
    codeforces?: any;
    codechef?: any;
    hackerrank?: any;
    github?: any;
}

const CodingSignals = () => {
    const { user, profile } = useAuth();
    const { toast } = useToast();

    // Form state
    const [usernames, setUsernames] = useState<PlatformUsernames>({});
    const [loading, setLoading] = useState(false);
    const [fetchingPlatform, setFetchingPlatform] = useState<string | null>(null);

    // Data state
    const [normalizedProfile, setNormalizedProfile] = useState<NormalizedProfile | null>(null);
    const [platformData, setPlatformData] = useState<PlatformData>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [lastFetched, setLastFetched] = useState<string | null>(null);

    // Load existing data on mount
    useEffect(() => {
        if (user?.id) {
            loadExistingData();
        }
    }, [user?.id]);

    const loadExistingData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/coding-signals/profile/${user?.id}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    setUsernames(data.data.platforms || {});
                    setPlatformData(data.data.raw || {});
                    setNormalizedProfile(data.data.normalized || null);
                    setLastFetched(data.data.fetchedAt);
                }
            }
        } catch (error) {
            // Silently fail - user may not have data yet
        }
    };

    const handleUsernameChange = (platform: string, value: string) => {
        setUsernames(prev => ({ ...prev, [platform]: value.trim() }));
        // Clear error when user types
        if (errors[platform]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[platform];
                return newErrors;
            });
        }
    };

    const fetchAllPlatforms = async () => {
        setLoading(true);
        setErrors({});

        try {
            const response = await fetch(`${API_URL}/api/coding-signals/fetch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user?.id,
                    platforms: usernames,
                    forceRefresh: true
                })
            });

            const data = await response.json();

            if (data.success) {
                setPlatformData(data.data.raw || {});
                setNormalizedProfile(data.data.normalized || null);
                setLastFetched(data.data.fetchedAt);

                if (data.data.errors) {
                    setErrors(data.data.errors);
                }

                toast({
                    title: "Signals Updated",
                    description: "Your coding profile has been refreshed!",
                });
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to fetch signals",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to connect to server",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchSinglePlatform = async (platform: string) => {
        const username = usernames[platform as keyof PlatformUsernames];
        if (!username) {
            toast({
                title: "Missing Username",
                description: `Please enter your ${platform} username`,
                variant: "destructive"
            });
            return;
        }

        setFetchingPlatform(platform);

        try {
            const response = await fetch(`${API_URL}/api/coding-signals/platform/${platform}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username })
            });

            const data = await response.json();

            if (data.success) {
                setPlatformData(prev => ({ ...prev, [platform]: data.data }));
                toast({
                    title: "Success",
                    description: `${platform} data fetched successfully!`
                });
            } else {
                setErrors(prev => ({ ...prev, [platform]: data.error }));
                toast({
                    title: "Error",
                    description: data.error || `Failed to fetch ${platform} data`,
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: `Failed to connect to ${platform}`,
                variant: "destructive"
            });
        } finally {
            setFetchingPlatform(null);
        }
    };

    const getMetricIcon = (metric: string) => {
        switch (metric) {
            case "problemSolving":
                return <Target className="h-5 w-5" />;
            case "algorithmicDepth":
                return <Brain className="h-5 w-5" />;
            case "consistency":
                return <TrendingUp className="h-5 w-5" />;
            case "competitiveStrength":
                return <Trophy className="h-5 w-5" />;
            default:
                return <BarChart3 className="h-5 w-5" />;
        }
    };

    const getMetricLabel = (metric: string) => {
        switch (metric) {
            case "problemSolving":
                return "Problem Solving";
            case "algorithmicDepth":
                return "Algorithmic Depth";
            case "consistency":
                return "Consistency";
            case "competitiveStrength":
                return "Competitive Strength";
            default:
                return metric;
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-500";
        if (score >= 60) return "text-blue-500";
        if (score >= 40) return "text-yellow-500";
        return "text-red-500";
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
            <div className="container mx-auto px-4 py-8 max-w-7xl">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                            <Code2 className="h-6 w-6 text-purple-400" />
                        </div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                            Coding Signal Engine
                        </h1>
                    </div>
                    <p className="text-gray-400 max-w-2xl">
                        Connect your coding platform accounts to build a unified skill profile.
                        This helps calibrate interview difficulty and provides personalized recommendations.
                    </p>
                </div>

                {/* Overall Score Card (if data exists) */}
                {normalizedProfile && (
                    <Card className="mb-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
                        <CardContent className="p-6 relative">
                            <div className="flex flex-col md:flex-row items-center gap-6">

                                {/* Grade Circle */}
                                <div className="flex-shrink-0">
                                    <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${GRADE_COLORS[normalizedProfile.overallGrade] || 'from-gray-500 to-gray-600'} flex items-center justify-center shadow-2xl`}>
                                        <div className="w-28 h-28 rounded-full bg-gray-900 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-bold">{normalizedProfile.overallGrade}</span>
                                            <span className="text-xs text-gray-400">Overall Grade</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics Grid */}
                                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                                    {["problemSolving", "algorithmicDepth", "consistency", "competitiveStrength"].map((metric) => (
                                        <div key={metric} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                            <div className="flex items-center gap-2 mb-2 text-gray-400">
                                                {getMetricIcon(metric)}
                                                <span className="text-xs">{getMetricLabel(metric)}</span>
                                            </div>
                                            <div className={`text-2xl font-bold ${getScoreColor(normalizedProfile[metric as keyof NormalizedProfile] as number)}`}>
                                                {Math.round(normalizedProfile[metric as keyof NormalizedProfile] as number)}
                                            </div>
                                            <Progress
                                                value={normalizedProfile[metric as keyof NormalizedProfile] as number}
                                                className="h-1.5 mt-2"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Platform Coverage */}
                            <div className="mt-6 flex flex-wrap items-center gap-2">
                                <span className="text-sm text-gray-400 mr-2">Connected:</span>
                                {PLATFORMS.map(platform => (
                                    <Badge
                                        key={platform.id}
                                        variant={normalizedProfile.platformCoverage[platform.id] ? "default" : "outline"}
                                        className={normalizedProfile.platformCoverage[platform.id]
                                            ? `bg-gradient-to-r ${platform.color} text-white border-0`
                                            : "text-gray-500 border-gray-700"
                                        }
                                    >
                                        <platform.Logo className={`w-4 h-4 ${normalizedProfile.platformCoverage[platform.id] ? "text-white" : "text-gray-500"}`} /> {platform.name}
                                        {normalizedProfile.platformCoverage[platform.id] && (
                                            <CheckCircle2 className="h-3 w-3 ml-1" />
                                        )}
                                    </Badge>
                                ))}
                            </div>

                            {lastFetched && (
                                <p className="text-xs text-gray-500 mt-4">
                                    Last updated: {new Date(lastFetched).toLocaleString()}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                <Tabs defaultValue="connect" className="space-y-6">
                    <TabsList className="bg-gray-800/50 border border-gray-700/50">
                        <TabsTrigger value="connect" className="data-[state=active]:bg-purple-500/20">
                            <Zap className="h-4 w-4 mr-2" />
                            Connect Platforms
                        </TabsTrigger>
                        <TabsTrigger value="details" className="data-[state=active]:bg-purple-500/20">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Detailed Stats
                        </TabsTrigger>
                        <TabsTrigger value="recommendations" className="data-[state=active]:bg-purple-500/20">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Recommendations
                        </TabsTrigger>
                    </TabsList>

                    {/* Connect Platforms Tab */}
                    <TabsContent value="connect" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {PLATFORMS.map(platform => (
                                <Card
                                    key={platform.id}
                                    className={`${platform.bgColor} border ${platform.borderColor} transition-all hover:scale-[1.02]`}
                                >
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <platform.Logo className={`w-6 h-6 ${platform.logoColor}`} />
                                                <CardTitle className="text-lg text-white">{platform.name}</CardTitle>
                                            </div>
                                            {platformData[platform.id as keyof PlatformData] && (
                                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                                            )}
                                        </div>
                                        <CardDescription className="text-gray-400">
                                            {platform.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <Label htmlFor={platform.id} className="text-gray-300 text-sm">
                                                Username / Handle
                                            </Label>
                                            <Input
                                                id={platform.id}
                                                placeholder={`Enter ${platform.name} username`}
                                                value={usernames[platform.id as keyof PlatformUsernames] || ""}
                                                onChange={(e) => handleUsernameChange(platform.id, e.target.value)}
                                                className="mt-1 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                                            />
                                            {errors[platform.id] && (
                                                <p className="text-red-400 text-xs mt-1">{errors[platform.id]}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 border-gray-700 hover:bg-gray-800"
                                                onClick={() => fetchSinglePlatform(platform.id)}
                                                disabled={fetchingPlatform === platform.id || !usernames[platform.id as keyof PlatformUsernames]}
                                            >
                                                {fetchingPlatform === platform.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                ) : (
                                                    <RefreshCw className="h-4 w-4 mr-2" />
                                                )}
                                                Fetch
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="px-2"
                                                onClick={() => window.open(`${platform.url}/${usernames[platform.id as keyof PlatformUsernames] || ""}`, "_blank")}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Fetch All Button */}
                        <div className="flex justify-center mt-6">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                                onClick={fetchAllPlatforms}
                                disabled={loading || Object.values(usernames).every(v => !v)}
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                ) : (
                                    <Sparkles className="h-5 w-5 mr-2" />
                                )}
                                Generate Unified Profile
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Detailed Stats Tab */}
                    <TabsContent value="details" className="space-y-4">
                        {Object.keys(platformData).length === 0 ? (
                            <Alert className="bg-gray-800/50 border-gray-700">
                                <Code2 className="h-4 w-4" />
                                <AlertTitle>No Data Yet</AlertTitle>
                                <AlertDescription>
                                    Connect your platform accounts in the "Connect Platforms" tab to see detailed statistics.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* LeetCode Stats */}
                                {platformData.leetcode && (
                                    <Card className="bg-orange-500/10 border-orange-500/30">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-orange-400">
                                                <LeetCodeLogo className="w-5 h-5" /> LeetCode Stats
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-green-400">
                                                        {platformData.leetcode.easySolved || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-400">Easy</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-yellow-400">
                                                        {platformData.leetcode.mediumSolved || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-400">Medium</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-red-400">
                                                        {platformData.leetcode.hardSolved || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-400">Hard</div>
                                                </div>
                                            </div>
                                            <div className="mt-4 text-center">
                                                <span className="text-3xl font-bold text-white">
                                                    {platformData.leetcode.totalSolved || 0}
                                                </span>
                                                <span className="text-gray-400 ml-2">problems solved</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Codeforces Stats */}
                                {platformData.codeforces && (
                                    <Card className="bg-blue-500/10 border-blue-500/30">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-blue-400">
                                                <CodeforcesLogo className="w-5 h-5" /> Codeforces Stats
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <div className="text-3xl font-bold text-white">
                                                        {platformData.codeforces.rating || "Unrated"}
                                                    </div>
                                                    <div className="text-sm text-gray-400">
                                                        {platformData.codeforces.rank || "No rank"}
                                                    </div>
                                                </div>
                                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                                    Max: {platformData.codeforces.maxRating || 0}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-center">
                                                <div>
                                                    <div className="text-xl font-bold text-white">
                                                        {platformData.codeforces.problemsSolved || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-400">Problems</div>
                                                </div>
                                                <div>
                                                    <div className="text-xl font-bold text-white">
                                                        {platformData.codeforces.contestsParticipated || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-400">Contests</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* CodeChef Stats */}
                                {platformData.codechef && (
                                    <Card className="bg-amber-500/10 border-amber-500/30">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-amber-400">
                                                <CodeChefLogo className="w-5 h-5" /> CodeChef Stats
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <div className="text-3xl font-bold text-white">
                                                        {platformData.codechef.currentRating || "Unrated"}
                                                    </div>
                                                    <div className="text-sm text-gray-400">
                                                        {"★".repeat(platformData.codechef.stars || 1)} Star
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-center">
                                                <div>
                                                    <div className="text-xl font-bold text-white">
                                                        {platformData.codechef.problemsSolved || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-400">Problems</div>
                                                </div>
                                                <div>
                                                    <div className="text-xl font-bold text-white">
                                                        {platformData.codechef.contests || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-400">Contests</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* HackerRank Stats */}
                                {platformData.hackerrank && (
                                    <Card className="bg-green-500/10 border-green-500/30">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-green-400">
                                                <HackerRankLogo className="w-5 h-5" /> HackerRank Stats
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-4 text-center mb-6">
                                                <div>
                                                    <div className="text-xl font-bold text-white">
                                                        {platformData.hackerrank.badges?.length || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-400">Badges</div>
                                                </div>
                                                <div>
                                                    <div className="text-xl font-bold text-white">
                                                        {platformData.hackerrank.certifications?.length || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-400">Certifications</div>
                                                </div>
                                                <div className="col-span-2">
                                                    <div className="text-xl font-bold text-white">
                                                        {platformData.hackerrank.totalSolved || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-400">Problems Solved</div>
                                                </div>
                                            </div>

                                            {/* Language Skills */}
                                            {platformData.hackerrank.languageSkills && Object.keys(platformData.hackerrank.languageSkills).length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="text-sm font-semibold text-gray-300 mb-2">Language Proficiency</div>
                                                    {Object.entries(platformData.hackerrank.languageSkills).map(([lang, stars]) => (
                                                        <div key={lang} className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-400">{lang}</span>
                                                            <span className="text-yellow-400 text-xs">
                                                                {"★".repeat(Number(stars))}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    {/* Recommendations Tab */}
                    <TabsContent value="recommendations" className="space-y-4">
                        {normalizedProfile?.recommendations && normalizedProfile.recommendations.length > 0 ? (
                            <div className="space-y-3">
                                {normalizedProfile.recommendations.map((rec, index) => (
                                    <Alert key={index} className="bg-gray-800/50 border-gray-700/50">
                                        <Award className="h-4 w-4 text-purple-400" />
                                        <AlertDescription className="text-gray-300">
                                            {rec}
                                        </AlertDescription>
                                    </Alert>
                                ))}
                            </div>
                        ) : (
                            <Alert className="bg-gray-800/50 border-gray-700">
                                <Sparkles className="h-4 w-4" />
                                <AlertTitle>Get Personalized Recommendations</AlertTitle>
                                <AlertDescription>
                                    Connect your coding platform accounts to receive AI-powered recommendations
                                    tailored to your skill level and goals.
                                </AlertDescription>
                            </Alert>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Ethical Notice */}
                <div className="mt-12 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                    <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        Privacy & Data Notice
                    </h3>
                    <p className="text-xs text-gray-500">
                        We only access publicly visible profile data from your connected accounts.
                        No passwords or private data are collected. Data is cached for 24 hours to reduce platform load.
                        You can disconnect any platform at any time.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default CodingSignals;
