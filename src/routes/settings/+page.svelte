<script lang="ts">
	import DashboardLayout from '$lib/components/DashboardLayout.svelte';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
</script>

<DashboardLayout>
	<div class="space-y-8">
		<!-- Header Section -->
		<div class="space-y-3">
			<h2 class="text-3xl font-semibold text-foreground tracking-tight">Settings</h2>
			<p class="text-lg text-muted-foreground">
				Configure your dashboard preferences and Python environment.
			</p>
		</div>

		<!-- Settings Grid -->
		<div class="grid gap-8">
			<Card class="bg-card border-border">
				<CardHeader class="p-6">
					<CardTitle class="text-xl font-semibold text-card-foreground">Python Environment</CardTitle>
					<CardDescription class="text-muted-foreground mt-2">
						Configure your Python interpreter and environment settings
					</CardDescription>
				</CardHeader>
				<CardContent class="p-6 pt-0 space-y-6">
					<div class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
						<div class="space-y-1">
							<p class="text-sm font-medium text-foreground">Python Path</p>
							<p class="text-xs text-muted-foreground">Current Python interpreter location</p>
						</div>
						<Button
							variant="outline"
							size="sm"
							class="px-4 py-2 bg-background border-border hover:bg-accent transition-colors duration-200"
						>
							Configure
						</Button>
					</div>
					<div class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
						<div class="space-y-1">
							<p class="text-sm font-medium text-foreground">Virtual Environment</p>
							<p class="text-xs text-muted-foreground">Manage Python virtual environments</p>
						</div>
						<Button
							variant="outline"
							size="sm"
							class="px-4 py-2 bg-background border-border hover:bg-accent transition-colors duration-200"
						>
							Manage
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card class="bg-card border-border">
				<CardHeader class="p-6">
					<CardTitle class="text-xl font-semibold text-card-foreground">Dashboard Preferences</CardTitle>
					<CardDescription class="text-muted-foreground mt-2">
						Customize your dashboard appearance and behavior
					</CardDescription>
				</CardHeader>
				<CardContent class="p-6 pt-0 space-y-6">
					<div class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
						<div class="space-y-1">
							<p class="text-sm font-medium text-foreground">Theme</p>
							<p class="text-xs text-muted-foreground">Choose your preferred color scheme</p>
						</div>
						<Button
							variant="outline"
							size="sm"
							class="px-4 py-2 bg-background border-border hover:bg-accent transition-colors duration-200"
						>
							Dark
						</Button>
					</div>
					<div class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
						<div class="space-y-1">
							<p class="text-sm font-medium text-foreground">Auto-refresh</p>
							<p class="text-xs text-muted-foreground">Automatically refresh dashboard data</p>
						</div>
						<Button
							variant="outline"
							size="sm"
							class="px-4 py-2 bg-background border-border hover:bg-accent transition-colors duration-200"
						>
							Enabled
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card class="bg-card border-border">
				<CardHeader class="p-6">
					<CardTitle class="text-xl font-semibold text-card-foreground">Script Management</CardTitle>
					<CardDescription class="text-muted-foreground mt-2">
						Configure how scripts are executed and managed
					</CardDescription>
				</CardHeader>
				<CardContent class="p-6 pt-0 space-y-6">
					<div class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
						<div class="space-y-1">
							<p class="text-sm font-medium text-foreground">Script Directory</p>
							<p class="text-xs text-muted-foreground">Default location for Python scripts</p>
						</div>
						<Button
							variant="outline"
							size="sm"
							class="px-4 py-2 bg-background border-border hover:bg-accent transition-colors duration-200"
						>
							Browse
						</Button>
					</div>
					<div class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
						<div class="space-y-1">
							<p class="text-sm font-medium text-foreground">Execution Timeout</p>
							<p class="text-xs text-muted-foreground">Maximum time for script execution</p>
						</div>
						<Button
							variant="outline"
							size="sm"
							class="px-4 py-2 bg-background border-border hover:bg-accent transition-colors duration-200"
						>
							30s
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card class="bg-card border-border">
				<CardHeader class="p-6">
					<CardTitle class="text-xl font-semibold text-card-foreground">About</CardTitle>
					<CardDescription class="text-muted-foreground mt-2">
						Dashboard information and version details
					</CardDescription>
				</CardHeader>
				<CardContent class="p-6 pt-0">
					<div class="space-y-4">
						<div class="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
							<span class="text-sm text-muted-foreground">Version:</span>
							<span class="text-sm font-medium text-foreground">1.0.0</span>
						</div>
						<div class="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
							<span class="text-sm text-muted-foreground">Framework:</span>
							<span class="text-sm font-medium text-foreground">SvelteKit + shadcn-svelte</span>
						</div>
						<div class="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
							<span class="text-sm text-muted-foreground">Python Support:</span>
							<span class="text-sm font-medium text-primary">Ready</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</DashboardLayout>
