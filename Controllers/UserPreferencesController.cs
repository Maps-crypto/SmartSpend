using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity;
using SmartSpend.Models;

namespace SmartSpend.Controllers
{
    public class UserPreferencesController : Controller
    {
        private ApplicationDbContext db = new ApplicationDbContext();

        // GET: UserPreferences
        public ActionResult Index()
        {
            return View(db.UserPreferences.ToList());
        }

        // GET: UserPreferences/Details/5
        public ActionResult Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            UserPreferences userPreferences = db.UserPreferences.Find(id);
            if (userPreferences == null)
            {
                return HttpNotFound();
            }
            return View(userPreferences);
        }

        // GET: UserPreferences/update
        public ActionResult update()
        {
            string mail = User.Identity.Name;
            ViewBag.email = mail;
            ViewBag.lett = mail[0];

            var uid = User.Identity.GetUserId();

            // Cast to int? so "no preferences yet" (an empty Where result) is
            // detectable as null instead of silently coming back as 0.
            var id = db.UserPreferences
                .Where(x => x.UserId == uid)
                .Select(x => (int?)x.UserPreferencesId)
                .FirstOrDefault();

            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }

            UserPreferences userPreferences = db.UserPreferences.Find(id);
            if (userPreferences == null)
            {
                return HttpNotFound();
            }
            return View(userPreferences);
        }

        // POST: UserPreferences/update
        // Same field list as Edit, but scoped to the signed-in user: the posted
        // UserPreferencesId/UserId are only ever used to confirm the save is
        // happening on that user's own row, never to pick which row gets saved.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult update([Bind(Include = "UserPreferencesId,UserId,Address,ShoppingFrequency,DietaryNeeds,Allergies,ProductStyle,CookingStyle,Lifestyle,Notifications")] UserPreferences userPreferences)
        {
            var uid = User.Identity.GetUserId();

            var owned = db.UserPreferences.AsNoTracking().FirstOrDefault(x => x.UserId == uid);
            if (owned == null || owned.UserPreferencesId != userPreferences.UserPreferencesId)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }

            // Ignore whatever the hidden UserId field said - always the signed-in user's own id.
            userPreferences.UserId = uid;

            if (ModelState.IsValid)
            {
                db.Entry(userPreferences).State = EntityState.Modified;
                db.SaveChanges();
                TempData["Success"] = "Preferences updated.";
                return RedirectToAction("update");
            }

            // Validation failed - re-render the same view, so it needs the same
            // ViewBag values the GET action sets for the layout header.
            ViewBag.email = User.Identity.Name;
            ViewBag.lett = User.Identity.Name[0];
            return View(userPreferences);
        }


        // GET: UserPreferences/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: UserPreferences/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create([Bind(Include = "UserPreferencesId,UserId,Address,ShoppingFrequency,DietaryNeeds,Allergies,ProductStyle,CookingStyle,Lifestyle,Notifications")] UserPreferences userPreferences)
        {
            if (ModelState.IsValid)
            {

                userPreferences.UserId = User.Identity.GetUserId();
                db.UserPreferences.Add(userPreferences);
                db.SaveChanges();
                TempData["Success"] = "Preferences Set. Welcome.";
                // One-shot flag: tells Main to open the shopping-list drawer and nudge the
                // user to enter a budget. TempData is consumed by the first Main render,
                // so refreshing or coming back later behaves like a normal visit.
                TempData["Onboarding"] = true;
                return RedirectToAction("Main", "Home");
            }

            return View(userPreferences);
        }

        // GET: UserPreferences/Edit/5
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            UserPreferences userPreferences = db.UserPreferences.Find(id);
            if (userPreferences == null)
            {
                return HttpNotFound();
            }
            return View(userPreferences);
        }

        // POST: UserPreferences/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "UserPreferencesId,UserId,Address,ShoppingFrequency,DietaryNeeds,Allergies,ProductStyle,CookingStyle,Lifestyle,Notifications")] UserPreferences userPreferences)
        {
            if (ModelState.IsValid)
            {
                db.Entry(userPreferences).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(userPreferences);
        }

        // GET: UserPreferences/Delete/5
        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            UserPreferences userPreferences = db.UserPreferences.Find(id);
            if (userPreferences == null)
            {
                return HttpNotFound();
            }
            return View(userPreferences);
        }

        // POST: UserPreferences/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            UserPreferences userPreferences = db.UserPreferences.Find(id);
            db.UserPreferences.Remove(userPreferences);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
