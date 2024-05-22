import playwright from "playwright";
import { test, expect } from "@playwright/test";
import { creds } from "../../data/credentials";

test.describe("SBT Deshboard", () => {
  let page: playwright.Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await page.goto("https://elearning.securityblue.team/");
  });

  test.afterAll(async ({ browser }, testInfo) => {
    await page.getByRole('link', { name: 'avatar' }).click();
    await page.getByRole('link', { name: ' Logout' }).click();
    expect(page.url()).toContain("/login");
    await browser.close();
  });

  test("is able to login", async () => {
    await page.getByPlaceholder("john@example.com").fill(creds.username);
    await page.locator("#login-password").fill(creds.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    const welcomeText = await page.getByText(/Welcome back, /).textContent();
    expect(welcomeText).toContain(creds.name);
  });

  test.describe("is able to navigate to dashboard", async () => {
    test("is able to navigate to Free Courses Page", async () => {
      await page.getByRole('link', { name: /Free Courses/ }).click();
      const cardTitle = await page.locator(".card-body h4").first().textContent();
      await page.locator('.card-footer .btn').first().click();
      const clickedCardTitle = await page.locator('.card h1').textContent();
      expect(cardTitle).toEqual(clickedCardTitle);
    });

    test("is able to navigate to Support", async () => {
      const page3Promise = page.waitForEvent('popup');
      await page.getByRole('link', { name: /Support/ }).click();
      const page3 = await page3Promise;
      const supportHeading = await page3.locator(".hero-inner h1").textContent();
      expect(supportHeading).toContain("How can we help you?");
    });

    test("is able to navigate to Refund Policy", async () => {
      const page4Promise = page.waitForEvent('popup');
      await page.getByRole('link', { name: 'Refunds Policy' }).click();
      const page4 = await page4Promise;
      const refundHeading = await page4.locator("article h1").textContent();
      expect(refundHeading).toContain("Refunds Policy".toUpperCase());
    });

    test("is able to navigate to certificates", async () => {
      await page.getByRole('link', { name: /Blue Team Level 1/ }).click();
      const certificateTitle = await page.locator('.card h1').textContent();
      expect(certificateTitle).toContain("Blue Team Level 1");
    });

    test("is able to navigate to profile", async () => {
      await page.getByRole('link', { name: /avatar/ }).click();
      await page.getByRole('link', { name: /Profile/ }).click();
      expect(page.url()).toContain("/profile");
    });

    // unable to verify the last text
    test.fail("is able to navigate through help bot", async () => {
      const mainFrame = page.frameLocator('iframe[title*="Button to launch messaging window"]')
      const messagingFrame = page.frameLocator('iframe[name="Messaging window"]')
      await mainFrame.getByLabel('Open messaging window').click();
      try {
        await messagingFrame.getByPlaceholder('Type a message').fill('Hi');
        await messagingFrame.getByLabel('Send message').click();
      } catch (error) {}
      await messagingFrame.getByRole('button', { name: /Certification/ }).click();
      await messagingFrame.getByRole('button', { name: /Blue Team Level 1/ }).click();
      await messagingFrame.getByRole('button', { name: 'Yes, this was helpful' }).click();
      const lastMessage = messagingFrame.locator("(//div[@shape='standalone'])[last()]").textContent();
      expect(lastMessage).toContain("Great");
    });
  });

});
