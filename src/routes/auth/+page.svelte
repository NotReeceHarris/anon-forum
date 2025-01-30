<script lang="ts">
    import { goto } from "$app/navigation";
    import "../../app.css";
    import type { PageProps } from "./$types";

    let { form }: PageProps = $props();

    let message = $state(form?.message || '');
    let error = $state(form?.error || '');
    let showing = $state('login');

    $effect(() => {
        if (form?.success) goto('/');
    });

</script>

<svelte:head>
    <link
        href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet"
    />
</svelte:head>

<!-- <form method="POST" action="?/register">
    <input
        type="text"
        name="invite"
        class="border-b"
        placeholder="invite code"
    />
    <input
        type="password"
        name="password"
        class="border-b"
        placeholder="password"
    />
    <button>register</button>
</form>

<form method="POST" action="?/login">
    <input
        type="text"
        name="username"
        class="border-b"
        placeholder="username"
    />
    <input
        type="password"
        name="password"
        class="border-b"
        placeholder="password"
    />
    <button>login</button>
</form>

{#if message}
    <p>{message}</p>
{/if}

{#if error}
    <p class="text-red-500">{error}</p>
{/if} -->

<div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

    {#if showing === 'login'}

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <form class="space-y-6" action="?/login" method="POST">
                    <div>
                        <label for="username" class="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <div class="mt-1">
                            <input id="username" name="username" type="text" autocomplete="username" required
                                class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Enter your username">
                        </div>
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div class="mt-1">
                            <input id="password" name="password" type="password" autocomplete="current-password" required
                                class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Enter your password">
                        </div>
                    </div>

                    {#if error}
                        <ul class="text-red-500 list-disc list-inside">
                            <li>{error}</li>
                        </ul>
                    {/if}

                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <input id="remember_me" name="remember_me" type="checkbox"
                                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                            <label for="remember_me" class="ml-2 block text-sm text-gray-900">
                                Remember me
                            </label>
                        </div>

                        <div class="text-sm">
                            <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
                                Forgot your password?
                            </a>
                        </div>
                        
                    </div>

                    <div class="flex flex-col gap-3 place-items-start">
                        <button
                            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Sign in
                        </button>
                        <button 
                            type="button" 
                            class="font-medium text-blue-600 hover:text-blue-500 text-sm"
                            onclick="{() => showing = 'register'}"
                        >
                            Don't have an account? Register
                        </button>
                    </div>
                </form>
            </div>
        </div>

    {:else if showing === 'register'}

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <form class="space-y-6" action="?/login" method="POST">
                    <div>
                        <label for="invite" class="block text-sm font-medium text-gray-700">
                            Invite Code
                        </label>
                        <div class="mt-1">
                            <input id="invite" name="invite" type="text" required
                                class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Enter your invite code">
                        </div>
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div class="mt-1">
                            <input id="password" name="password" type="password" autocomplete="current-password" required
                                class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Enter your password">
                        </div>
                    </div>

                    {#if error}
                        <ul class="text-red-500 list-disc list-inside">
                            <li>{error}</li>
                        </ul>
                    {/if}

                    <div class="flex flex-col gap-3 place-items-start">
                        <button
                            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Register
                        </button>
                        <button 
                            type="button" 
                            class="font-medium text-blue-600 hover:text-blue-500 text-sm"
                            onclick="{() => showing = 'login'}"
                        >
                            Already have an account? Login
                        </button>
                    </div>
                </form>
            </div>
        </div>

    {/if}

</div>