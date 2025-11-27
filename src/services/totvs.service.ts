import { env } from '../config/env';
import { logger } from '../config/logger';
import { UnauthorizedError } from '../utils/errors';
import https from 'https';
import http from 'http';
import { URL } from 'url';

export interface TotvsLoginResponse {
	desc_erro: string;
	nome: string;
	login: string;
}

export interface FractioningItemResponse {
	it_codigo: string;
	desc_item: string;
}

export interface FractioningDepositResponse {
	cod_depos: string;
	nome: string;
}

export interface FractioningLocationResponse {
	cod_local: string;
	nome: string;
}

export interface FractioningBatchResponse {
	lote: string;
	dt_lote: string;
}

export interface FractioningBoxResponse {
	it_codigo: string;
	desc_item: string;
	quant_usada: string;
	mensagem: string;
}

export interface FractioningFinalizeResponse {
	desc_erro: string;
}

export class TotvsService {
	private static sharedCookies: Map<string, string> = new Map();
	
	private get cookies(): Map<string, string> {
		return TotvsService.sharedCookies;
	}

	private getBaseUrl(): string {
		if (env.TOTVS_API_ENVIRONMENT === 'production') {
			return 'http://totvs.asperbras.com/dts/datasul-rest';
		}
		return env.TOTVS_API_BASE_URL;
	}

	private getDomainKey(url: URL): string {
		return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}`;
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

	private getCookieHeader(url: URL): string {
		const domainKey = this.getDomainKey(url);
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
			logger.debug('Cookie stored', { name, domain: this.getDomainKey(url) });
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

	async getItem(it_codigo: string): Promise<FractioningItemResponse> {
		const baseUrl = this.getBaseUrl();
		const url = `${baseUrl}/resources/prg/cpp/v1/escp1001?tipo=4&it_codigo=${encodeURIComponent(it_codigo)}`;
		return this.makeRequestWithoutAuth<FractioningItemResponse>(url);
	}

	async getDeposits(cod_estabel: string): Promise<FractioningDepositResponse[]> {
		const baseUrl = this.getBaseUrl();
		const url = `${baseUrl}/resources/prg/cpp/v1/escp1001?tipo=1&cod_estabel=${encodeURIComponent(cod_estabel)}`;
		return this.makeRequestWithoutAuth<FractioningDepositResponse[]>(url);
	}

	async getLocations(cod_estabel: string, cod_deposito: string): Promise<FractioningLocationResponse[]> {
		const baseUrl = this.getBaseUrl();
		const url = `${baseUrl}/resources/prg/cpp/v1/escp1001?tipo=2&cod_estabel=${encodeURIComponent(cod_estabel)}&cod_deposito=${encodeURIComponent(cod_deposito)}`;
		return this.makeRequestWithoutAuth<FractioningLocationResponse[]>(url);
	}

	async getBatches(cod_estabel: string, it_codigo: string, cod_deposito: string, cod_local: string): Promise<FractioningBatchResponse> {
		const baseUrl = this.getBaseUrl();
		const url = `${baseUrl}/resources/prg/cpp/v1/escp1001?tipo=3&cod_estabel=${encodeURIComponent(cod_estabel)}&it_codigo=${encodeURIComponent(it_codigo)}&cod_deposito=${encodeURIComponent(cod_deposito)}&cod_local=${encodeURIComponent(cod_local)}`;
		return this.makeRequestWithoutAuth<FractioningBatchResponse>(url);
	}

	async getBoxReturn(cod_estabel: string, it_codigo: string, cod_deposito: string, cod_local: string, cod_lote: string, quantidade: number): Promise<FractioningBoxResponse> {
		const baseUrl = this.getBaseUrl();
		const url = `${baseUrl}/resources/prg/cpp/v1/escp1001?tipo=5&cod_estabel=${encodeURIComponent(cod_estabel)}&it_codigo=${encodeURIComponent(it_codigo)}&cod_deposito=${encodeURIComponent(cod_deposito)}&cod_local=${encodeURIComponent(cod_local)}&cod_lote=${encodeURIComponent(cod_lote)}&quantidade=${encodeURIComponent(quantidade)}`;
		return this.makeRequestWithoutAuth<FractioningBoxResponse>(url);
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
		batelada?: string
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
			params.append('ordem_producao', ordem_producao);
		}
		if (batelada) {
			params.append('batelada', batelada);
		}

		const url = `${baseUrl}/resources/prg/cpp/v1/escp1001?${params.toString()}`;
		return this.makeRequestWithoutAuth<FractioningFinalizeResponse>(url);
	}

	private async makeRequest(login: string, senha: string, urlString: string, maxRedirects: number = 5): Promise<TotvsLoginResponse> {
		return new Promise((resolve, reject) => {
			if (maxRedirects <= 0) {
				reject(new Error('Too many redirects'));
				return;
			}

			const url = new URL(urlString);
			const authHeader = this.createBasicAuth(login, senha);

			const cookieHeader = this.getCookieHeader(url);
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

	private async makeRequestWithoutAuth<T>(urlString: string, maxRedirects: number = 5): Promise<T> {
		return new Promise((resolve, reject) => {
			if (maxRedirects <= 0) {
				reject(new Error('Too many redirects'));
				return;
			}

			const url = new URL(urlString);

			const cookieHeader = this.getCookieHeader(url);
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
						
						this.makeRequestWithoutAuth<T>(redirectUrl, maxRedirects - 1)
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
						reject(new Error(`TOTVS API error: ${res.statusCode} ${res.statusMessage}`));
						return;
					}

					try {
						const responseData = JSON.parse(data) as T;
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
}

