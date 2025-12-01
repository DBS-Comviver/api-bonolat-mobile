import { env } from '../config/env';
import { logger } from '../config/logger';
import { UnauthorizedError } from '../utils/errors';
import { CredentialsRepository } from '../modules/auth/repositories/credentials.repository';
import https from 'https';
import http from 'http';
import { URL } from 'url';
import type {
	FractioningItemResponse,
	FractioningDepositResponse,
	FractioningLocationResponse,
	FractioningBatchResponse,
	FractioningBoxResponse,
	FractioningFinalizeResponse
} from '../modules/fractioning/types/fractioning.types';

export interface TotvsLoginResponse {
	desc_erro: string;
	nome: string;
	login: string;
}

export class TotvsService {
	private static sharedCookies: Map<string, string> = new Map();
	private static isRefreshingLogin: Map<string, boolean> = new Map();
	private credentialsRepository = new CredentialsRepository();
	
	private get cookies(): Map<string, string> {
		return TotvsService.sharedCookies;
	}

	private clearCookies(): void {
		TotvsService.sharedCookies.clear();
		logger.debug('TOTVS cookies cleared');
	}

	private getBaseUrl(): string {
		return env.TOTVS_API_BASE_URL;
	}


	private parseCookies(setCookieHeaders: string | string[] | undefined): Map<string, string> {
		const cookieMap = new Map<string, string>();
		
		if (!setCookieHeaders) {
			return cookieMap;
		}

		const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];

		for (const header of headers) {
			if (!header) continue;
			
			const cookiePart = header.split(';')[0]?.trim();
			if (!cookiePart) continue;
			
			const [name, value] = cookiePart.split('=');
			if (name && value) {
				cookieMap.set(name.trim(), value.trim());
			}
		}

		return cookieMap;
	}

	private getCookieHeader(): string {
		const cookies: string[] = [];

		for (const [name, value] of this.cookies.entries()) {
			if (name && value) {
				cookies.push(`${name}=${value}`);
			}
		}

		return cookies.join('; ');
	}

	private updateCookies(url: URL, setCookieHeaders: string | string[] | undefined): void {
		const newCookies = this.parseCookies(setCookieHeaders);
		
		for (const [name, value] of newCookies.entries()) {
			this.cookies.set(name, value);
			logger.debug('Cookie stored', { name });
		}
	}

	private createBasicAuth(username: string, password: string): string {
		const credentials = `${username}:${password}`;
		return Buffer.from(credentials).toString('base64');
	}

	async validateLogin(login: string, senha: string): Promise<TotvsLoginResponse> {
		const baseUrl = this.getBaseUrl();
		const url = `${baseUrl}/resources/prg/cdp/v1/escd0002?tipo=1&login=${encodeURIComponent(login)}&senha=${encodeURIComponent(senha)}`;

		logger.debug('TOTVS login attempt', { login, environment: env.TOTVS_API_ENVIRONMENT });

		try {
			const response = await this.makeRequest(login, senha, url);
			logger.info('TOTVS login successful', { login });
			return response;
		} catch (error: any) {
			logger.debug('First TOTVS login attempt failed', { login, error: error.message });
		}

		const loginWithDomain = `${login}@asperbras`;
		const urlWithDomain = `${baseUrl}/resources/prg/cdp/v1/escd0002?tipo=1&login=${encodeURIComponent(loginWithDomain)}&senha=${encodeURIComponent(senha)}`;

		try {
			const response = await this.makeRequest(loginWithDomain, senha, urlWithDomain);
			logger.info('TOTVS login successful with domain', { login: loginWithDomain });
			return response;
		} catch (error: any) {
			logger.debug('Second TOTVS login attempt failed', { login: loginWithDomain, error: error.message });
		}

		logger.warn('TOTVS login failed for both attempts', { login });
		throw new UnauthorizedError('Invalid username or password');
	}

	async getItem(it_codigo: string, userLogin?: string): Promise<FractioningItemResponse> {
		const baseUrl = this.getBaseUrl();
		const url = `${baseUrl}/resources/prg/cpp/v1/escp1001?tipo=4&it_codigo=${encodeURIComponent(it_codigo)}`;
		return this.makeRequestWithoutAuth<FractioningItemResponse>(url, 5, userLogin);
	}

	async getDeposits(cod_estabel: string, userLogin?: string): Promise<FractioningDepositResponse[]> {
		const baseUrl = this.getBaseUrl();
		const url = `${baseUrl}/resources/prg/cpp/v1/escp1001?tipo=1&cod_estabel=${encodeURIComponent(cod_estabel)}`;
		return this.makeRequestWithoutAuth<FractioningDepositResponse[]>(url, 5, userLogin);
	}

	async getLocations(cod_estabel: string, cod_deposito: string, userLogin?: string): Promise<FractioningLocationResponse[]> {
		const baseUrl = this.getBaseUrl();
		const url = `${baseUrl}/resources/prg/cpp/v1/escp1001?tipo=2&cod_estabel=${encodeURIComponent(cod_estabel)}&cod_deposito=${encodeURIComponent(cod_deposito)}`;
		return this.makeRequestWithoutAuth<FractioningLocationResponse[]>(url, 5, userLogin);
	}

	async getBatches(cod_estabel: string, it_codigo: string, cod_deposito: string, cod_local: string, userLogin?: string): Promise<FractioningBatchResponse> {
		const baseUrl = this.getBaseUrl();
		const url = `${baseUrl}/resources/prg/cpp/v1/escp1001?tipo=3&cod_estabel=${encodeURIComponent(cod_estabel)}&it_codigo=${encodeURIComponent(it_codigo)}&cod_deposito=${encodeURIComponent(cod_deposito)}&cod_local=${encodeURIComponent(cod_local)}`;
		return this.makeRequestWithoutAuth<FractioningBatchResponse>(url, 5, userLogin);
	}

	async getBoxReturn(cod_estabel: string, it_codigo: string, cod_deposito: string, cod_local: string, cod_lote: string, quantidade: number, userLogin?: string): Promise<FractioningBoxResponse> {
		const baseUrl = this.getBaseUrl();
		const url = `${baseUrl}/resources/prg/cpp/v1/escp1001?tipo=5&cod_estabel=${encodeURIComponent(cod_estabel)}&it_codigo=${encodeURIComponent(it_codigo)}&cod_deposito=${encodeURIComponent(cod_deposito)}&cod_local=${encodeURIComponent(cod_local)}&cod_lote=${encodeURIComponent(cod_lote)}&quantidade=${encodeURIComponent(quantidade)}`;
		return this.makeRequestWithoutAuth<FractioningBoxResponse>(url, 5, userLogin);
	}

	async finalizeFractioning(
		cod_estabel: string,
		it_codigo: string,
		cod_deposito: string,
		cod_local: string,
		cod_lote: string,
		quantidade: number,
		dados_baixa: string,
		ordem_producao?: string,
		batelada?: string,
		userLogin?: string
	): Promise<FractioningFinalizeResponse> {
		const baseUrl = this.getBaseUrl();

		const params = new URLSearchParams({
			tipo: '6',
			cod_estabel,
			it_codigo,
			cod_deposito,
			cod_local,
			cod_lote,
			quantidade: quantidade.toString(),
			dados_baixa
		});

		if (ordem_producao) {
			params.append('op', ordem_producao);
		}
		if (batelada) {
			params.append('batelada', batelada);
		}

		const url = `${baseUrl}/resources/prg/cpp/v1/escp1001?${params.toString()}`;
		return this.makeRequestWithoutAuth<FractioningFinalizeResponse>(url, 5, userLogin);
	}

	private async makeRequest(login: string, senha: string, urlString: string, maxRedirects: number = 5): Promise<TotvsLoginResponse> {
		return new Promise((resolve, reject) => {
			if (maxRedirects <= 0) {
				reject(new Error('Too many redirects'));
				return;
			}

			const url = new URL(urlString);
			const authHeader = this.createBasicAuth(login, senha);

			const cookieHeader = this.getCookieHeader();
			const headers: Record<string, string> = {
				'Authorization': `Basic ${authHeader}`,
				'Content-Type': 'application/json',
			};

			if (cookieHeader) {
				headers['Cookie'] = cookieHeader;
			}

			const options = {
				hostname: url.hostname,
				port: url.port || (url.protocol === 'https:' ? 443 : 80),
				path: url.pathname + url.search,
				method: 'GET',
				headers,
			};

			const client = url.protocol === 'https:' ? https : http;

			const req = client.request(options, (res) => {
				if (res.headers['set-cookie']) {
					this.updateCookies(url, res.headers['set-cookie']);
				}

				if (res.statusCode && [301, 302, 307, 308].includes(res.statusCode)) {
					const location = res.headers.location;
					if (location) {
						req.destroy();
						const redirectUrl = location.startsWith('http') 
							? location 
							: `${url.protocol}//${url.host}${location}`;
						
						logger.debug('TOTVS API redirect', { 
							from: urlString, 
							to: redirectUrl, 
							statusCode: res.statusCode,
							login 
						});
						
						this.makeRequest(login, senha, redirectUrl, maxRedirects - 1)
							.then(resolve)
							.catch(reject);
						return;
					}
				}

				let data = '';

				res.on('data', (chunk) => {
					data += chunk;
				});

				res.on('end', () => {
					if (res.statusCode === 401) {
						reject(new UnauthorizedError('Invalid credentials'));
						return;
					}

					if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
						reject(new Error(`TOTVS API error: ${res.statusCode} ${res.statusMessage}`));
						return;
					}
					if (res.statusCode === 200) {
						try {
							const responseData = JSON.parse(data) as TotvsLoginResponse;
							logger.info('TOTVS login successful - 200 OK', { login, desc_erro: responseData.desc_erro });
							resolve(responseData);
							return;
						} catch (error) {
							logger.warn('TOTVS response parse failed but status is 200', { login, error });
							resolve({
								desc_erro: 'OK',
								nome: login,
								login: login
							});
							return;
						}
					}

					try {
						const responseData = JSON.parse(data) as TotvsLoginResponse;

						if (responseData.desc_erro !== 'RETORNO VÁLIDO') {
							reject(new UnauthorizedError('Invalid credentials'));
							return;
						}

						resolve(responseData);
					} catch (error) {
						reject(new Error(`Failed to parse TOTVS response: ${error}`));
					}
				});
			});

			req.on('error', (error) => {
				reject(new Error(`TOTVS API request failed: ${error.message}`));
			});

			req.end();
		});
	}

	private async makeRequestWithoutAuth<T>(urlString: string, maxRedirects: number = 5, userLogin?: string): Promise<T> {
		return new Promise((resolve, reject) => {
			if (maxRedirects <= 0) {
				reject(new Error('Too many redirects'));
				return;
			}

			const url = new URL(urlString);

			const cookieHeader = this.getCookieHeader();
			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
			};

			if (cookieHeader) {
				headers['Cookie'] = cookieHeader;
			}

			const options = {
				hostname: url.hostname,
				port: url.port || (url.protocol === 'https:' ? 443 : 80),
				path: url.pathname + url.search,
				method: 'GET',
				headers,
			};

			const client = url.protocol === 'https:' ? https : http;

			const req = client.request(options, (res) => {
				if (res.headers['set-cookie']) {
					this.updateCookies(url, res.headers['set-cookie']);
				}

				if (res.statusCode && [301, 302, 307, 308].includes(res.statusCode)) {
					const location = res.headers.location;
					if (location) {
						req.destroy();
						const redirectUrl = location.startsWith('http') 
							? location 
							: `${url.protocol}//${url.host}${location}`;
						
						logger.debug('TOTVS API redirect', { 
							from: urlString, 
							to: redirectUrl, 
							statusCode: res.statusCode 
						});
						
						if (redirectUrl.includes('totvs-login') || redirectUrl.includes('loginForm')) {
							logger.warn('TOTVS redirect to login page detected', { redirectUrl, originalUrl: urlString, userLogin });

							if (userLogin && !TotvsService.isRefreshingLogin.get(userLogin)) {
								TotvsService.isRefreshingLogin.set(userLogin, true);
								logger.info('Attempting automatic TOTVS login refresh', { userLogin });

							this.credentialsRepository.get(userLogin)
								.then((storedPassword) => {
									if (!storedPassword) {
										this.clearCookies();
										TotvsService.isRefreshingLogin.set(userLogin, false);
										throw new UnauthorizedError('TOTVS session expired. User credentials not found. Please login again.');
									}
									
									return this.validateLogin(userLogin, storedPassword);
								})
									.then(() => {
										logger.info('TOTVS automatic login successful, retrying original request', { userLogin });
										TotvsService.isRefreshingLogin.set(userLogin, false);

										return this.makeRequestWithoutAuth<T>(urlString, maxRedirects - 1, userLogin);
									})
									.then(resolve)
									.catch((loginError) => {
										logger.error('TOTVS automatic login failed', { error: loginError.message, userLogin });
										TotvsService.isRefreshingLogin.set(userLogin, false);
										
										if (loginError instanceof UnauthorizedError) {
											reject(loginError);
										} else {
											this.clearCookies();
											reject(new UnauthorizedError(`TOTVS session expired. Please login again.`));
										}
									});
								return;
							} else if (!userLogin) {
								reject(new Error('TOTVS session expired. Redirect to login page detected but user login not provided.'));
								return;
							} else {
								setTimeout(() => {
									this.makeRequestWithoutAuth<T>(urlString, maxRedirects - 1, userLogin)
										.then(resolve)
										.catch(reject);
								}, 1000);
								return;
							}
						}
						
						this.makeRequestWithoutAuth<T>(redirectUrl, maxRedirects - 1, userLogin)
							.then(resolve)
							.catch(reject);
						return;
					}
				}

				let data = '';

				res.on('data', (chunk) => {
					data += chunk;
				});

				res.on('end', () => {
					if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
						logger.error('TOTVS API error', {
							statusCode: res.statusCode,
							statusMessage: res.statusMessage,
							url: urlString,
							responseBody: data.substring(0, 500),
						});
						reject(new Error(`TOTVS API error: ${res.statusCode} ${res.statusMessage || 'Unknown error'}`));
						return;
					}

					if (!data || data.trim() === '') {
						logger.warn('TOTVS API returned empty response', { url: urlString });
						

						if (urlString.includes('tipo=6')) {
							const defaultResponse = {
								total: 1,
								hasNext: false,
								items: [{
									mensagem: 'OK',
									it_codigo: '',
									desc_item: '',
									quant_usada: 0,
								}],
							} as T;
							resolve(defaultResponse);
							return;
						}

						try {
							const responseData = {} as T;
							resolve(responseData);
						} catch (error) {
							reject(new Error(`TOTVS API returned empty response and cannot create default object`));
						}
						return;
					}

					if (data.trim().startsWith('<') || data.trim().startsWith('<!--')) {
						logger.warn('TOTVS returned HTML instead of JSON (likely login page)', { 
							url: urlString,
							responsePreview: data.substring(0, 200)
						});
						
						if (userLogin && !TotvsService.isRefreshingLogin.get(userLogin)) {
							TotvsService.isRefreshingLogin.set(userLogin, true);
							logger.info('Attempting automatic TOTVS login refresh due to HTML response', { userLogin });

							this.credentialsRepository.get(userLogin)
								.then((storedPassword) => {
									if (!storedPassword) {
										TotvsService.isRefreshingLogin.set(userLogin, false);
										reject(new Error('TOTVS session expired. User credentials not found. Please login again.'));
										return;
									}
									
									return this.validateLogin(userLogin, storedPassword);
								})
								.then(() => {
									logger.info('TOTVS automatic login successful, retrying original request', { userLogin });
									TotvsService.isRefreshingLogin.set(userLogin, false);

									return this.makeRequestWithoutAuth<T>(urlString, maxRedirects - 1, userLogin);
								})
								.then(resolve)
								.catch((loginError) => {
									logger.error('TOTVS automatic login failed', { error: loginError.message, userLogin });
									TotvsService.isRefreshingLogin.set(userLogin, false);
									
									if (loginError instanceof UnauthorizedError) {
										reject(loginError);
									} else {
										this.clearCookies();
										reject(new UnauthorizedError(`TOTVS session expired. Please login again.`));
									}
								});
							return;
						} else if (!userLogin) {
							reject(new Error('TOTVS returned HTML (login page) but user login not provided'));
							return;
						} else {
							setTimeout(() => {
								this.makeRequestWithoutAuth<T>(urlString, maxRedirects - 1, userLogin)
									.then(resolve)
									.catch(reject);
							}, 1000);
							return;
						}
					}

					try {
						const responseData = JSON.parse(data) as T;
						resolve(responseData);
					} catch (error) {
						logger.error('Failed to parse TOTVS response', {
							url: urlString,
							responseBody: data.substring(0, 500),
							error: error instanceof Error ? error.message : String(error),
						});
						reject(new Error(`Failed to parse TOTVS response: ${error instanceof Error ? error.message : String(error)}. Response: ${data.substring(0, 200)}`));
					}
				});
			});

			req.on('error', (error) => {
				reject(new Error(`TOTVS API request failed: ${error.message}`));
			});

			req.end();
		});
	}
}